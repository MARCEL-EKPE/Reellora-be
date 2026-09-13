import { forwardRef, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {

    private oauthClient: OAuth2Client;

    constructor(
        /**
         * Injecting jwt configuration
         */
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

        /**
         * Injecting usersService 
         */
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,

        /**
         * Injecting generateTokensProvider 
         */
        private readonly generateTokensProvider: GenerateTokensProvider,
    ) { }

    onModuleInit() {
        const clientId = this.jwtConfiguration.googleClientId;
        const clientSecret = this.jwtConfiguration.googleClientSecret;
        this.oauthClient = new OAuth2Client(clientId, clientSecret);
    }

    public async authenticate(googleTokenDto: GoogleTokenDto) {

        try {
            // Verify the Google token sent by the user
            const loginTicket = await this.oauthClient.verifyIdToken({ idToken: googleTokenDto.token });
            // Extract payload from Google JWT
            const { email, sub: googleId, given_name: userName, picture } = loginTicket.getPayload() ?? {};

            if (!googleId || !email) {
                throw new NotFoundException('Invalid Google account information');
            }

            // Find the user in the database using googleId
            let user = await this.usersService.findOneUserByGoogleId(googleId);

            if (!user) {
                user = await this.usersService.createGoogleUser({
                    email: email,
                    userName: userName ?? '',
                    googleId: googleId,
                    picture: picture ?? '',
                })
            }

            // Return generated tokens
            return this.generateTokensProvider.generateTokens(user!);

        } catch (error) {

            throw new NotFoundException('Invalid or expired Google token');

        }

    }
}
