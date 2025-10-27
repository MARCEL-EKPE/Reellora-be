import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/users/enums/user-role.enum';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2'
import { type ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';

@Injectable()
export class AdminSeedService implements OnModuleInit {

    constructor(
        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        /** 
         * Injecting appConfiguration
        */
        @Inject(appConfig.KEY)
        private readonly appConfiguration: ConfigType<typeof appConfig>
    ) { }

    async onModuleInit() {

        try {

            const adminEmail = this.appConfiguration.adminEmail ?? 'admin@example.com'
            const adminPassword = this.appConfiguration.adminPassword ?? 'Admin@123'

            const adminExists = await this.usersRepository.findOneBy({ email: adminEmail });
            if (!adminExists) {
                const hashPassword = await argon2.hash(adminPassword)

                const admin = this.usersRepository.create({
                    email: adminEmail,
                    userName: 'Admin',
                    password: hashPassword,
                    role: UserRole.ADMIN
                })

                await this.usersRepository.save(admin)
            }
        } catch (error) {
            console.error('Error seeding admin user:', error)
        }
    }
}
