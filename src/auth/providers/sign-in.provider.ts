import { forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashingProvider } from './hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, type ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {

    constructor(

        /**
         * Injecting usersService
         */
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,

        /**
         * Injecting hashingProvider
         */
        private readonly hashinProvider: HashingProvider,

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
        private readonly configService: ConfigService,

        /**
         * Injecting generateTokensProvider
         */
        private readonly generateTokensProvider: GenerateTokensProvider
    ) { }

    public async signIn(signInDto: SignInDto) {
        // find the user using email
        const user = await this.usersService.findOneUserByEmail(signInDto.email)

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        // Check if user has a password (for social login users who might not have passwords)
        if (!user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        // compare password
        let isVerified: boolean = false

        try {
            isVerified = await this.hashinProvider.comparePassword(signInDto.password, user.password)

        } catch (error) {

            throw new InternalServerErrorException('Password comparison failed');
        }

        if (!isVerified) {
            throw new UnauthorizedException('Invalid credentials')
        }

        return await this.generateTokensProvider.generateTokens(user)

    }

}
