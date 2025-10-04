import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FindOneUserByEmailProvider {

    constructor(

        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    public async findOneByEmail(email: string): Promise<User> {

        try {
            const user = await this.usersRepository.findOne({
                where: { email },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid Credentials')
            }

            return user
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error
            }

            // Todo:Use NestJS logger 
            console.error('Error finding user:', error);

            throw new InternalServerErrorException('Failed to find user.');

        }
    }
}
