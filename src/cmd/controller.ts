import inquirer from 'inquirer'
import dotenv from 'dotenv'
import ws from 'ws'
import type { Packet } from '../types/packet'
import * as nanoid from 'nanoid'
import crypto from 'crypto'
import fs from 'fs'
import { decrypt, encrypt, generateRandomKey } from '../common/aes'

dotenv.config()

const url = new URL(process.env.BYTESOCKS_INSTANCE || '');

const key = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});


// load the server public keys in pwd public.pem
const remPem = fs.readFileSync('public.pem', 'utf-8');

// load it as a key to encrypt things with
const remKey = crypto.createPublicKey(remPem);

(async () => {
    const query = await inquirer
        .prompt([{ type: 'input', name: 'key', message: 'enter key' }])

    url.pathname = query.key.trim()
    
    const socket = new ws(url.toString())
    console.log(url.toString())

    socket.on('open', () => {
        const data : Packet = {
            id: nanoid.nanoid(),
            msgType: 'HELLO',
            data: null,
            timestamp: Date.now()
        }

        socket.send(JSON.stringify(data))
    })

    socket.on('message', (data) => {
        console.log('recv ->', new String(data))

        try {
            const packet : Packet = JSON.parse(data.toString())
            
            if (packet.msgType === 'CHALLENGE') {
                const challenge = packet.data;
                const encrypted = crypto.publicEncrypt(remKey, Buffer.from(challenge));

                const response : Packet = {
                    id: nanoid.nanoid(),
                    msgType: 'CHALLENGE_RES',
                    data: encrypted.toString('base64'),
                    timestamp: Date.now()
                }

                socket.send(JSON.stringify(response))
            }

            if (packet.msgType === 'SEND_CONPUB') {
                const response : Packet = {
                    id: nanoid.nanoid(),
                    msgType: 'SEND_CONPUB',
                    data: key.publicKey,
                    timestamp: Date.now()
                }

                socket.send(JSON.stringify(response))
            }

            if (packet.msgType === 'ACK') {
                console.log('ack');

                (async() => {
                    while (true) {
                        if (socket.readyState !== ws.OPEN) {
                            console.error('socket not open')
                            return;
                        }

                        const query = await inquirer
                            .prompt([{ type: 'input', name: 'key', message: 'enter msg' }]);

                        const randomKey = generateRandomKey();
                        const encryptedText = encrypt(query.key, randomKey);

                        const encryptedRandomKey = crypto.publicEncrypt(remKey!, Buffer.from(randomKey.toString('base64')));

                        const response : Packet = {
                            id: nanoid.nanoid(),
                            msgType: 'FRAME_CON',
                            data: encryptedText,
                            dataKey: encryptedRandomKey.toString('base64'),
                            timestamp: Date.now()
                        }

                        socket.send(JSON.stringify(response))
                    }
                })();
            }

            if (packet.msgType === 'FRAME_REM') {
                if (packet.dataKey) {
                    const decryptedKey = crypto.privateDecrypt(key.privateKey, Buffer.from(packet.dataKey, 'base64')).toString('utf-8')
                    console.log('decrypted key ->', decryptedKey)

                    const decryptedData = decrypt(packet.data, Buffer.from(decryptedKey, 'base64'))
                    console.log('decrypted data ->', decryptedData)
                } else {
                    const decrypted = crypto.privateDecrypt(key.privateKey, Buffer.from(packet.data, 'base64')).toString('utf-8')
                    console.log('decrypted ->', decrypted)
                }
            }
        } catch (e) {
            console.error(e)
            console.error('not json')
        }
    })
})();

