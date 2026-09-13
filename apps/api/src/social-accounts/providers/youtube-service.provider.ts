import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { google } from 'googleapis';
import youtubeConfig from '../config/youtube.config';
import { type ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { SocialAccounts } from '../social-accounts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetOneUserParamDto } from 'src/users/dtos/get-one-user.dto';
import { CreateChannelDto } from '../dtos/create-channel.dto';

@Injectable()
export class YoutubeServiceProvider {
    private oauth2Client

    constructor(
        /**
         * Injecting socialAcconts Repository
         */
        @InjectRepository(SocialAccounts)
        private readonly socialAccountsRepository: Repository<SocialAccounts>,
        /**
         * injecting usersService
         */
        private readonly usersService: UsersService,
        /**
         * Injecting youtube configuration
         */
        @Inject(youtubeConfig.KEY)
        private readonly youtubeConfiguration: ConfigType<typeof youtubeConfig>
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            this.youtubeConfiguration.googleClientId,
            this.youtubeConfiguration.googleSecret,
            this.youtubeConfiguration.googleRedirectUri,
        );
    }

    getYoutubeAuthUrl() {
        const scopes = ['https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.upload'
        ];
        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
        return { url };
    }

    async getYoutubeChannelDetails(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

        const res = await youtube.channels.list({
            mine: true,
            part: ['snippet', 'id'],
        });

        return {
            tokens,
            channels: res.data.items?.map((ch) => ({
                id: ch.id,
                title: ch.snippet?.title,
                thumbnail: ch.snippet?.thumbnails?.default?.url,
            }))
        }
    }

    async saveYoutubeChannel(userId: string, createChannelDto: CreateChannelDto) {
        const userIdDto = { id: userId } as GetOneUserParamDto;

        try {
            const user = await this.usersService.findOneUser(userIdDto);

            if (!user) {
                throw new NotFoundException(`User not found with ID: ${userId}`);
            }

            const newChannel = this.socialAccountsRepository.create({
                ...createChannelDto,
                user,
            });

            const savedChannel = await this.socialAccountsRepository.save(newChannel);

            return savedChannel;
        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error;
            }

            // Todo:Use NestJS logger 
            console.error(
                `Failed to save YouTube channel for user ${userId}:`,
                error
            );

            throw new InternalServerErrorException(
                'Unable to save YouTube channel at this time. Please try again later.'
            );
        }
    }

    async getYoutubeChannels(userId: string) {

        try {
            const channels = await this.socialAccountsRepository.find({
                where: { user: { id: userId } },
                relations: ['user']
            })

            if (!channels.length) {
                throw new NotFoundException('No linked channels found')
            }
            return channels

        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error
            }

            // Todo:Use NestJS logger 
            console.error('Error finding user:', error);

            throw new InternalServerErrorException('Failed to find user.');
        }

    }

    async removeYoutubeChannel(channelId: string, userId: string) {

        try {
            const account = await this.socialAccountsRepository.findOne({
                where: { id: channelId, user: { id: userId } },
            });

            if (!account) {
                throw new NotFoundException(
                    `Channel with ID ${channelId} not found or you are not authorized to delete it.`
                );
            }

            await this.socialAccountsRepository.delete(account);

            return { message: 'Channel removed successfully.' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Todo:Use NestJS logger
            console.error(
                'Failed to remove channel',
                error
            );

            throw new InternalServerErrorException(
                'Unable to remove channel at this time. Please try again later.'
            );
        }
    }

}
