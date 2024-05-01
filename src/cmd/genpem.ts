// Create RSA private key and public key in PEM format to pwd

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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
})

fs.writeFileSync(path.join(process.cwd(), 'private.pem'), key.privateKey)

fs.writeFileSync(path.join(process.cwd(), 'public.pem'), key.publicKey)

console.log('Keys generated successfully')
