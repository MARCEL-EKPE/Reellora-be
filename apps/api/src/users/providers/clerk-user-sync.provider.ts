import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class ClerkUserSyncProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async findOrCreateByClerkId(
    clerkId: string,
    email: string,
    userName?: string,
  ): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: [{ clerkId }, { email }],
      });

      if (existingUser) {
        if (!existingUser.clerkId) {
          existingUser.clerkId = clerkId;
          await this.usersRepository.save(existingUser);
        }
        return existingUser;
      }

      const newUser = this.usersRepository.create({
        clerkId,
        email,
        userName: userName || email.split('@')[0],
        role: UserRole.USER,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      console.error('Failed to sync Clerk user:', error);
      throw new InternalServerErrorException('Failed to sync user.');
    }
  }
}
