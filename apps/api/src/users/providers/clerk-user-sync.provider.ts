import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User as ClerkUser } from '@clerk/backend';
import { User } from '../user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class ClerkUserSyncProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async findByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { clerkId } });
  }

  /**
   * Create or update a local user from the full Clerk user profile.
   * Fills email, userName, picture, and OAuth provider IDs.
   */
  public async syncFromClerkUser(clerkUser: ClerkUser): Promise<User> {
    try {
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        '';

      const googleAccount = clerkUser.externalAccounts.find(
        (account) => account.provider === 'google' || account.provider === 'oauth_google',
      );
      const facebookAccount = clerkUser.externalAccounts.find(
        (account) => account.provider === 'facebook' || account.provider === 'oauth_facebook',
      );

      const userName =
        clerkUser.username ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');

      let user = await this.usersRepository.findOne({
        where: [{ clerkId: clerkUser.id }, ...(email ? [{ email }] : [])],
      });

      if (!user) {
        user = this.usersRepository.create({
          clerkId: clerkUser.id,
          email,
          userName: userName || (email ? email.split('@')[0] : clerkUser.id),
          role: UserRole.USER,
        });
      }

      user.clerkId = clerkUser.id;
      if (email) user.email = email;
      if (userName) user.userName = userName;
      if (clerkUser.imageUrl) user.picture = clerkUser.imageUrl;
      if (googleAccount?.providerUserId) user.googleId = googleAccount.providerUserId;
      if (facebookAccount?.providerUserId) user.facebookId = facebookAccount.providerUserId;

      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Failed to sync Clerk user:', error);
      throw new InternalServerErrorException('Failed to sync user.');
    }
  }
}
