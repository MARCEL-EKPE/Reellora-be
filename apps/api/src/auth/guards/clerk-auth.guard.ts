import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { verifyToken } from '@clerk/backend';
import { REQUEST_USER_KEY } from '../constants/auth.constants';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });

      const clerkId = payload.sub;
      const email = payload.email as string | undefined;
      const user = await this.usersService.findOrCreateByClerkId(
        clerkId,
        email || '',
        (payload.username as string) ||
          (payload.first_name as string) ||
          undefined,
      );

      request[REQUEST_USER_KEY] = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Clerk token verification failed');
    }
  }

  private extractTokenFromHeader(request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
