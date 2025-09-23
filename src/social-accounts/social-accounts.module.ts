import { Module } from '@nestjs/common';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './providers/social-accounts.service';

@Module({
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService]
})
export class SocialAccountsModule {}
