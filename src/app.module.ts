import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SocialAccountsModule } from './social-accounts/social-accounts.module';

@Module({
  imports: [UsersModule, SocialAccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
