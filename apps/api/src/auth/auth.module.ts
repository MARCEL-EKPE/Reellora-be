import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { HashingProvider } from './providers/hashing.provider';
import { Argon2Provider } from './providers/argon2.provider';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Module({
  providers: [
    ClerkAuthGuard,
    {
      provide: HashingProvider,
      useClass: Argon2Provider,
    },
  ],
  imports: [forwardRef(() => UsersModule)],
  exports: [ClerkAuthGuard, HashingProvider],
})
export class AuthModule {}
