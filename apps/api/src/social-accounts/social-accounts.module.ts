import { Module, OnModuleInit } from '@nestjs/common';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './providers/social-accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccounts } from './social-accounts.entity';
import { UsersModule } from 'src/users/users.module';
import { YoutubeServiceProvider } from './providers/youtube-service.provider';
import { ConfigModule } from '@nestjs/config';
import { CryptoServiceProvider } from './providers/crypto-service.provider';
import youtubeConfig from './config/youtube.config';
import { setCryptoServiceProvider } from './social-accounts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccounts]),
    UsersModule,
  ConfigModule.forFeature(youtubeConfig)
  ],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService, YoutubeServiceProvider, CryptoServiceProvider]
})
export class SocialAccountsModule implements OnModuleInit {

  constructor(
    /**
    * Injecting crytoServiceProvider
    */
    private readonly crytoServiceProvider: CryptoServiceProvider
  ) { }

  onModuleInit() {
    setCryptoServiceProvider(this.crytoServiceProvider);
  }

}
