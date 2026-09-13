import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { SocialAccounts } from '../social-accounts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { YoutubeServiceProvider } from './youtube-service.provider';

@Injectable()
export class SocialAccountsService {

    constructor(
        /**
         * Injecting usersService
         */
        private readonly usersService: UsersService,
        /**
         * Injecting youtubeService
         */
        private readonly youtubeServiceProvider: YoutubeServiceProvider,

        /**
       * Injecting socialAcconts Repository
       */
        @InjectRepository(SocialAccounts)
        private readonly socialAccountsRepository: Repository<SocialAccounts>
    ) { }

    async getYoutubeChannels(userId: string) {
        return this.youtubeServiceProvider.getYoutubeChannels(userId)
    }

    async getYoutubeAuthUrl() {
        return this.youtubeServiceProvider.getYoutubeAuthUrl()
    }
    async getYoutubeChannelDetails(code: string) {
        return this.youtubeServiceProvider.getYoutubeChannelDetails(code)
    }

    async saveYoutubeChannel(userId: string, createChannelDto: CreateChannelDto) {
        return this.youtubeServiceProvider.saveYoutubeChannel(userId, createChannelDto)
    }

    async removeYoutubeChannel(channelId: string, userId: string) {
        return this.youtubeServiceProvider.removeYoutubeChannel(channelId, userId)
    }
}