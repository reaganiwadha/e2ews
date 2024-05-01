import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const ivHex = 'abcdef0123456789';

const iv = Buffer.from(ivHex, 'hex');

export function generateRandomKey(): Buffer {
    return crypto.randomBytes(32);
}

export function encrypt(text: string, keyHex: Buffer): string {
    const cipher = crypto.createCipheriv(algorithm, keyHex, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export function decrypt(encryptedText: string, keyHex: Buffer): string {
    const decipher = crypto.createDecipheriv(algorithm, keyHex, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    // decrypted += decipher.final('utf8');
    return decrypted;
}
