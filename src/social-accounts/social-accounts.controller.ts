import { Body, Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { SocialAccountsService } from './providers/social-accounts.service';
import { CurrentUserData } from 'src/auth/decorators/current-user-data.decorator';
import { type CurrentUser } from 'src/auth/interfaces/current-user.interface';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('social-accounts')
export class SocialAccountsController {
    constructor(
        /**
         * injecting SocialAccountsService
         */
        private readonly socialAccountsService: SocialAccountsService

    ) { }

    @Get('my')
    getMyAccounts(@CurrentUserData() user: CurrentUser,) {
        return this.socialAccountsService.getYoutubeChannels(user.sub);
    }

    @Get('youtube/link')
    @Auth(AuthType.None)
    async linkYoutube() {
        return this.socialAccountsService.getYoutubeAuthUrl();
    }
    @Get('youtube/exchange-code')
    @Auth(AuthType.None)
    async getYoutubeChannelDetails(@Query('code') code: string) {
        return this.socialAccountsService.getYoutubeChannelDetails(code);
    }

    @Post('youtube/save')
    async saveYoutubeChannel(
        @CurrentUserData() user: CurrentUser,
        @Body() createChannelDto: CreateChannelDto,) {
        return this.socialAccountsService.saveYoutubeChannel(user.sub, createChannelDto);
    }

    @Delete(':id')
    removeAccount(@Param('id') id: string, @CurrentUserData() user: CurrentUser) {
        return this.socialAccountsService.removeYoutubeChannel(id, user.sub);
    }
}
