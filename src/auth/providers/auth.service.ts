import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        /**
         * Injecting usersService
         */
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,

        /**
         * Injecting signInProvider
         */
        private readonly signInProvider: SignInProvider,

        /**
         * Injecting refreshTokensProvider
         */
        private readonly refreshTokensProvider: RefreshTokensProvider,
    ) { }

    public signIn(signInDto: SignInDto) {
        return this.signInProvider.signIn(signInDto)
    }

    public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        return this.refreshTokensProvider.refreshTokens(refreshTokenDto)
    }

}
