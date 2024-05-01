import axios from 'axios'
import dotenv from 'dotenv'
import ws from 'ws'
import type { Packet } from '../types/packet'
import * as nanoid from 'nanoid'
import fs from 'fs';
import crypto from 'crypto';
import inquirer from 'inquirer'
import { decrypt, encrypt, generateRandomKey } from '../common/aes'

dotenv.config()

// parse url and append /create
const url = new URL(process.env.BYTESOCKS_INSTANCE || '')
url.pathname = '/create';


// load the server public keys and private keys in pwd public.pem private.pem
const remPem = fs.readFileSync('public.pem', 'utf-8');
const pem = fs.readFileSync('private.pem', 'utf-8');

// load it as a key to encrypt things with
const remKey = crypto.createPublicKey(remPem);
const key = crypto.createPrivateKey(pem);

let challenge = '';

let conPub : crypto.KeyObject | null = null;

(async () => {
    const response = await axios.get(url.toString())
    console.log(response.data)

    url.pathname = response.data.key

    const socket = new ws(url.toString())

    socket.on('open', () => {
        console.log('connected')
    })

    socket.on('message', (data) => {
        console.log('recv ->', new String(data))

        // try parse json
        try {
            const packet : Packet = JSON.parse(data.toString())
            
            if (packet.msgType === 'HELLO') {
                challenge = nanoid.nanoid(64)

                const response : Packet = {
                    id: nanoid.nanoid(),
                    msgType: 'CHALLENGE',
                    data: challenge,
                    timestamp: Date.now()
                }

                socket.send(JSON.stringify(response))
            }

            if (packet.msgType === 'CHALLENGE_RES') {
                const decrypted = crypto.privateDecrypt(key, Buffer.from(packet.data, 'base64')).toString('utf-8')
                console.log('decrypted ->', decrypted)

                if (decrypted === challenge) {
                    const response : Packet = {
                        id: nanoid.nanoid(),
                        msgType: 'SEND_CONPUB',
                        data: null,
                        timestamp: Date.now()
                    }

                    socket.send(JSON.stringify(response))
                }
            }

            if (packet.msgType === 'SEND_CONPUB') {
                conPub = crypto.createPublicKey(packet.data);

                const response : Packet = {
                    id: nanoid.nanoid(),
                    msgType: 'ACK',
                    data: null,
                    timestamp: Date.now()
                }

                socket.send(JSON.stringify(response));

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

                        const encryptedRandomKey = crypto.publicEncrypt(conPub!, Buffer.from(randomKey.toString('base64')));

                        const response : Packet = {
                            id: nanoid.nanoid(),
                            msgType: 'FRAME_REM',
                            data: encryptedText,
                            dataKey: encryptedRandomKey.toString('base64'),
                            timestamp: Date.now()
                        }

                        socket.send(JSON.stringify(response))
                    }
                })()
            }

            if (packet.msgType === 'FRAME_CON') {
                if (packet.dataKey) {
                    const decryptedKey = crypto.privateDecrypt(key, Buffer.from(packet.dataKey, 'base64')).toString('utf-8')
                    console.log('decrypted key ->', decryptedKey)

                    const decryptedData = decrypt(packet.data, Buffer.from(decryptedKey, 'base64'))
                    console.log('decrypted data ->', decryptedData)
                } else {
                    const decrypted = crypto.privateDecrypt(key, Buffer.from(packet.data, 'base64')).toString('utf-8')
                    console.log('decrypted ->', decrypted)
                }
            }
        } catch (e) {
            console.error(e)
        }
    })
})()
