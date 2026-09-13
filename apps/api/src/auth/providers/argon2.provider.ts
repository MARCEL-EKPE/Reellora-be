import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as argon2 from 'argon2'

@Injectable()
export class Argon2Provider implements HashingProvider {

    async hashPassword(password: string | Buffer): Promise<string> {

        return argon2.hash(password);
    }

    async comparePassword(password: string | Buffer, encrypted: string): Promise<boolean> {

        return argon2.verify(encrypted, password);
    }
}
