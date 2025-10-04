import { Body, Controller, Get, Post, Req, Delete, Param, Request } from '@nestjs/common';
import { LinkYoutubeDto } from './dtos/link-youtube.dto';
import { SelectChannelDto } from './dtos/select-channel.dto';
import { SocialAccountsService } from './providers/social-accounts.service';

@Controller('social-accounts')
export class SocialAccountsController {
    constructor(
        /**
         * injecting SocialAccountsService
         */
        private readonly socialAccountsService: SocialAccountsService

    ) { }

    @Get('my')
    getMyAccounts(@Req() req: Request) {
        //TODO: get authenticated user id form req.user.id

        return this.socialAccountsService.getAccounts('b229f0df-4a5f-4999-b996-e30141424235');
    }

    @Post('youtube/link')
    async linkYoutube(@Body() linkYoutubeDto: LinkYoutubeDto) {
        return this.socialAccountsService.linkYoutube(linkYoutubeDto);
    }

    @Post('youtube/save')
    async saveYoutubeChannel(@Req() req: Request, @Body() selectChannelDto: SelectChannelDto,) {

        //TODO: get authenticated user id form req.user.id
        return this.socialAccountsService.saveYoutubeChannel('2a3220a6-307b-42e4-911f-0b9ceb163a49', selectChannelDto);
    }

    @Delete(':id')
    removeAccount(@Param('id') id: string, @Req() req: Request) {
        //TODO: get authenticated user id form req.user.id

        return this.socialAccountsService.removeAccount(id, '98ef9bd1-bc22-4c48-bb40-2bd9da1f4903');
    }
}
