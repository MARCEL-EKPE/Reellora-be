import { Injectable } from '@nestjs/common';
import { LinkYoutubeDto } from '../dtos/link-youtube.dto';
import { SelectChannelDto } from '../dtos/select-channel.dto';

@Injectable()
export class SocialAccountsService {

    async getAccounts(userId: string) {
        return "Get all user's social accounts"
    }

    async linkYoutube(linkYoutubeDto: LinkYoutubeDto) {
        return {
            message: 'service to link a youtube account',
            linkYoutubeDto
        };
    }

    async saveYoutubeChannel(userId: string, selectChannelDto: SelectChannelDto) {
        return {
            message: 'Service to save channel',
            selectChannelDto
        }
    }

    async removeAccount(id: string, userId: string) {
        return `account removed with id ${id}`;
    }

}
