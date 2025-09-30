import { Injectable, NotFoundException } from '@nestjs/common';
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
        const channels = this.socialAccountsRepository.find({
            where: { user: { id: userId } },
        })

        return channels
    }

    async linkYoutube(linkYoutubeDto: LinkYoutubeDto) {
        return {
            message: 'service to link a youtube account',
            linkYoutubeDto
        };
    }

    async saveYoutubeChannel(userId: string, selectChannelDto: SelectChannelDto) {

        const id = { id: userId } as GetOneUserParamDto;
        const user = await this.usersService.findOneUser(id)

        if (!user) throw new NotFoundException('user not found')
        let newChannel = this.socialAccountsRepository.create({
            ...selectChannelDto,
            user
        })

        newChannel = await this.socialAccountsRepository.save(newChannel)

        return newChannel
    }

    async removeAccount(channelId: string, userId: string) {

        // Check if the account belongs to the user
        const account = await this.socialAccountsRepository.findOne({
            where: { id: channelId, user: { id: userId } },
        });

        if (!account) {
            throw new NotFoundException('Channel not found or not authorized to delete.');
        }

        await this.socialAccountsRepository.remove(account);

        return { message: 'Channel removed successfully.' };
    }

}
