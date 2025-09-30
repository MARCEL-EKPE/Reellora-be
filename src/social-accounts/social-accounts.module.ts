import { Module } from '@nestjs/common';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './providers/social-accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccounts } from './social-accounts.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccounts]), UsersModule],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService]
})
export class SocialAccountsModule { }
