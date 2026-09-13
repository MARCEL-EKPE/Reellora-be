import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

@Injectable()
export class CryptoServiceProvider {

    private readonly algorithm = 'aes-256-ctr';
    private readonly key: Buffer;

    constructor(

        /**
         * Injecting configservice
         */
        private readonly configService: ConfigService
    ) {
        const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
        if (!keyHex) {
            throw new Error('ENCRYPTION_KEY is not defined in your environment');
        }
        this.key = Buffer.from(keyHex, 'hex');
        if (this.key.length !== 32) {
            throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
        }
    }

    encrypt(text: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    decrypt(encryptedText: string): string {
        const [ivHex, contentHex] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const content = Buffer.from(contentHex, 'hex');
        const decipher = createDecipheriv(this.algorithm, this.key, iv);
        const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
        return decrypted.toString('utf8');
    }
}
