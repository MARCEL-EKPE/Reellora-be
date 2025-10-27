import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/users/enums/user-role.enum';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2'

@Injectable()
export class AdminSeedService implements OnModuleInit {

    constructor(
        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    async onModuleInit() {
        const adminExists = await this.usersRepository.findOne({ where: { role: UserRole.ADMIN } })
        if (!adminExists) {
            const hashPassword = await argon2.hash('Admin@123')

            const admin = this.usersRepository.create({
                email: 'admin@example.com',
                userName: 'Admin',
                password: hashPassword,
                role: UserRole.ADMIN
            })

            await this.usersRepository.save(admin)
            console.log('Admin user created sucessfully')
        } else {
            console.log('Admin user already exists')
        }

    }
}
