import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class CreateUserProvider {

    constructor(

        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        /**
         * Injecting hashingProvider
         */
        @Inject(forwardRef(() => HashingProvider))
        private readonly hashingProvider: HashingProvider

    ) { }


    public async ceateUser(createUserDto: CreateUserDto): Promise<User> {

        try {
            const existingUser = await this.usersRepository.findOne({
                where: { email: createUserDto.email },
            })

            if (existingUser) {
                throw new ConflictException('A user with this email already exists.')
            }

            let newUser = this.usersRepository.create({
                ...createUserDto,
                password: await this.hashingProvider.hashPassword(createUserDto.password)
            });
            newUser = await this.usersRepository.save(newUser)
            return newUser;

        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            // Todo:Use NestJS logger 
            console.error('Failed to create user:', error);

            throw new InternalServerErrorException('Failed to create user.');

        }
    }

}
