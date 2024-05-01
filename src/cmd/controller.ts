import inquirer from 'inquirer'
import dotenv from 'dotenv'
import ws from 'ws'
import type { Packet } from '../types/packet'
import * as nanoid from 'nanoid'
import crypto from 'crypto'

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


// load the server public keys


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
    })
})();

