import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class RefreshTokensProvider {

    constructor(
        /**
        * Injecting jwtService
        */
        private readonly jwtService: JwtService,

        /**
         * Injecting jwtConfiguration
         */
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

        /**
         * Injecting generateTokensProvider
         */
        private readonly generateTokensProvider: GenerateTokensProvider,

        /**
         * Injecting usersService
         */
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,

    ) { }

    public async refreshTokens(refreshTokenDto: RefreshTokenDto) {

        try {
            const { sub } = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer
            })

            const user = await this.usersService.findOneUser(sub);

            return await this.generateTokensProvider.generateTokens(user)
        } catch (error) {
            throw new UnauthorizedException(error)
        }

    }
}
