import { Body, Controller, Post } from '@nestjs/common';
import { FacebookAuthenticationService } from './providers/facebook-authentication.service';
import { FacebookTokenDto } from './dtos/facebook-token.dto';

@Controller('facebook-authentication')
export class FacebookAuthenticationController {
    constructor(
        /**
         * Injecting facebookAuthenticationService
         */
        private readonly facebookAuthenticationService: FacebookAuthenticationService
    ) { }

    @Post()
    public async authenticate(@Body() facebookTokenDto: FacebookTokenDto) {
        return this.facebookAuthenticationService.authenticate(facebookTokenDto)
    }
}
