import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider';

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
        private readonly signInProvider: SignInProvider
    ) { }

    public signIn(signInDto: SignInDto) {
        return this.signInProvider.signIn(signInDto)
    }

    public isAuth() {
        return console.log(true)
    }
}
