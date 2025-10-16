import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthenticationService } from './providers/google-authentication.service';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { AuthType } from '../enums/auth-type.enum';
import { Auth } from '../decorators/auth.decorator';

@Auth(AuthType.None)
@Controller('google-authentication')
export class GoogleAuthenticationController {

    constructor(
        /**
         * Injecting googleAuthenticationService
         */
        private readonly googleAuthenticationService: GoogleAuthenticationService
    ) { }

    @Post()
    public async authenticate(@Body() googleTokenDto: GoogleTokenDto) {
        return await this.googleAuthenticationService.authenticate(googleTokenDto)
    }
}