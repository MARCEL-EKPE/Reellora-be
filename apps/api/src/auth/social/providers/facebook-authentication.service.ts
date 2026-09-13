import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { FacebookTokenDto } from '../dtos/facebook-token.dto';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';

@Injectable()
export class FacebookAuthenticationService {

    constructor(
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

    public async authenticate(facebookTokenDto: FacebookTokenDto) {

        try {
            // Verify the Facebook token sent by the user
            const { data } = await axios.get(
                `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${facebookTokenDto.token}`,
            );
            const { id: facebookId, email, name: userName, picture } = data

            if (!email || !facebookId) {
                throw new NotFoundException('Invalid Facebook account information');
            }

            //Find user in the database using facebookId
            let user = await this.usersService.findOneUserByFacebookId(facebookId);

            if (!user) {
                user = await this.usersService.createFacebookUser({
                    email,
                    userName,
                    facebookId,
                    picture: picture.data.url,
                })
            }

            // Return generated tokens
            return this.generateTokensProvider.generateTokens(user!);

            //create user if not found and return token
        } catch (error) {

            throw new NotFoundException('Invalid or expired Facebook token');
        }

    }
}
