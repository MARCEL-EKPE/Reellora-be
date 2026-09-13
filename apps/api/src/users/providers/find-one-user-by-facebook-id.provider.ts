import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FindOneUserByFacebookIdProvider {

    constructor(
        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    public async findOneByFacebookId(facebookId: string) {

        return this.usersRepository.findOneBy({ facebookId })
    }
}

