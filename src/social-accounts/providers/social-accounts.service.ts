import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LinkYoutubeDto } from '../dtos/link-youtube.dto';
import { SelectChannelDto } from '../dtos/select-channel.dto';
import { UsersService } from 'src/users/providers/users.service';
import { GetOneUserParamDto } from 'src/users/dtos/get-one-user.dto';
import { Repository } from 'typeorm';
import { SocialAccounts } from '../social-accounts.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SocialAccountsService {

    constructor(
        /**
         * Injecting usersService
         */
        private readonly usersService: UsersService,

        /**
       * Injecting socialAcconts Repository
       */
        @InjectRepository(SocialAccounts)
        private readonly socialAccountsRepository: Repository<SocialAccounts>
    ) { }

    async getAccounts(userId: string) {

        try {
            const channels = await this.socialAccountsRepository.find({
                where: { user: { id: userId } },
            })

            if (!channels) {
                throw new NotFoundException(`No linked channels found for user ID: ${userId}`)
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

    async linkYoutube(linkYoutubeDto: LinkYoutubeDto) {
        return {
            message: 'service to link a youtube account',
            linkYoutubeDto
        };
    }

    async saveYoutubeChannel(userId: string, selectChannelDto: SelectChannelDto) {
        try {
            const id = { id: userId } as GetOneUserParamDto;
            const user = await this.usersService.findOneUser(id);

            if (!user) {
                throw new NotFoundException(`User not found with ID: ${userId}`);
            }

            const newChannel = this.socialAccountsRepository.create({
                ...selectChannelDto,
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

    async removeAccount(channelId: string, userId: string) {

        try {
            const account = await this.socialAccountsRepository.findOne({
                where: { id: channelId, user: { id: userId } },
            });

            if (!account) {
                throw new NotFoundException(
                    `Channel with ID ${channelId} not found or you are not authorized to delete it.`
                );
            }

            await this.socialAccountsRepository.remove(account);

            return { message: 'Channel removed successfully.' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Todo:Use NestJS logger
            console.error(
                `Failed to remove channel ${channelId} for user ${userId}:`,
                error
            );

            throw new InternalServerErrorException(
                'Unable to remove channel at this time. Please try again later.'
            );
        }
    }
}