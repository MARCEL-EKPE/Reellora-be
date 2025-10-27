import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, type ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { User } from 'src/users/user.entity';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class GenerateTokensProvider {

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
         * Injecting cofigService 
         */
        private readonly configService: ConfigService

    ) { }

    public async signToken<T>(userId: string, expiresIn: number, payload?: T) {

        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload
            },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn,
            }
        )
    }

    public async generateTokens(user: User) {

        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<CurrentUser>>(user.id, this.jwtConfiguration.accessTokenTtl, {
                email: user.email,
                role: user.role
            }),

            this.signToken(user.id, this.jwtConfiguration.refershTokenTtl)
        ])

        return { accessToken, refreshToken }

    }

}

