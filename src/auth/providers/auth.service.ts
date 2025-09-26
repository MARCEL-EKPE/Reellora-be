import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthService {
    constructor(
        /**
         * Injecting usersService
         */
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService
    ) { }

    public login(email: string, password: string, id: string) {
        // Check whether user exist in database
        // login
        // token
    }

    public isAuth() {
        return console.log(true)
    }
}
