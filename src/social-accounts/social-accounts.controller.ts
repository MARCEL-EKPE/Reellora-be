import { Body, Controller, Get, Post, Req, Delete, Param } from '@nestjs/common';
import { LinkYoutubeDto } from './dtos/link-youtube.dto';
import { SelectChannelDto } from './dtos/select-channel.dto';
import type { Request } from 'express';
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
        /**
         * get authenticated user id form req.user.id
         */
        return this.socialAccountsService.getAccounts('authenticatedUserId');
    }

    @Post('youtube/link')
    async linkYoutube(@Body() linkYoutubeDto: LinkYoutubeDto) {
        return this.socialAccountsService.linkYoutube(linkYoutubeDto);
    }

    @Post('youtube/save')
    async saveYoutubeChannel(@Req() req: Request, @Body() selectChannelDto: SelectChannelDto,) {
        return this.socialAccountsService.saveYoutubeChannel('authenticatedUserId', selectChannelDto);
    }

    @Delete(':id')
    removeAccount(@Param('id') id: string, @Req() req: Request) {
        return this.socialAccountsService.removeAccount(id, 'authenticatedUserId');
    }
}
