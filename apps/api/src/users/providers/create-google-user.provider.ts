import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleUser } from '../interfaces/google-user.interface';

@Injectable()
export class CreateGoogleUserProvider {

    constructor(
        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }


    public async createGoogleUser(googleUser: GoogleUser) {
        try {
            const user = this.usersRepository.create(googleUser);
            return await this.usersRepository.save(user)

        } catch (error) {
            throw new ConflictException(error, { description: 'Could not create user' })
        }

    }
}
