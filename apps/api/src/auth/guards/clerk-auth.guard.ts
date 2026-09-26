import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Request } from 'express';
import { UsersService } from 'src/users/providers/users.service';
import { REQUEST_USER_KEY } from '../constants/auth.constants';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    let clerkId: string;
    try {
      const payload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });
      clerkId = payload.sub;
    } catch {
      throw new UnauthorizedException('Clerk token verification failed');
    }

    let user = await this.usersService.findOneByClerkId(clerkId);

    if (!user || !user.picture) {
      const clerk = createClerkClient({
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });
      const clerkUser = await clerk.users.getUser(clerkId);
      user = await this.usersService.syncFromClerkUser(clerkUser);
    }

    request[REQUEST_USER_KEY] = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
