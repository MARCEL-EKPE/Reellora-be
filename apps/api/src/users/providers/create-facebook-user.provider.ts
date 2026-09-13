import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookUser } from '../interfaces/facebook-user.interface';
import { error } from 'console';

@Injectable()
export class CreateFacebookUserProvider {

    constructor(
        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    public async createFacebookUser(faceBookUser: FacebookUser) {

        try {
            const user = this.usersRepository.create(faceBookUser);
            return await this.usersRepository.save(user)

        } catch (error) { }

        throw new ConflictException(error, { description: 'Could not create user' })
    }

}
