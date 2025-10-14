import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessTokenGuard } from './access-token/access-token.guard';
import { AuthType } from '../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  private readonly defaultAuthType = AuthType.Bearer

  private readonly authTypeGuardMap: Record<AuthType, CanActivate>;

  constructor(
    /**
     * Injecting the reflector class to access metadata
     */
    private readonly reflector: Reflector,

    /**
     * Injecting the accessTokenGuard
     */
    private readonly accessTokenGuard: AccessTokenGuard

  ) {

    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };

  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const authTypes = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()])
      ?? [this.defaultAuthType]

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]);

    let lastError: unknown

    for (const instance of guards) {
      try {
        const canActivate = await Promise.resolve(instance.canActivate(context))

        if (canActivate) {
          return true
        }
      } catch (error) {
        lastError = error
      }

    }

    throw lastError || new UnauthorizedException('Authentication failed');
  }
}
