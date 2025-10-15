import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FindOneUserByGoogleIdProvider {

    constructor(
        /**
         * Injecting Users Repository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    public async findOneUserByGoogleId(googleId: string) {
        return await this.usersRepository.findOneBy({ googleId })
    }
}
