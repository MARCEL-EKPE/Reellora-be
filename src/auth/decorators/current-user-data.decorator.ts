import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../interfaces/current-user.interface';
import { REQUEST_USER_KEY } from '../constants/auth.constants';

export const CurrentUserData = createParamDecorator(

    (field: keyof CurrentUser | undefined, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();

        const user: CurrentUser = request[REQUEST_USER_KEY]

        return field ? user?.[field] : user;
    },
);