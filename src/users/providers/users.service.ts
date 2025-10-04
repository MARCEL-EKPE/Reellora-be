import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GetAllUsersParamDto } from '../dtos/get-users.dto';
import { GetOneUserParamDto } from '../dtos/get-one-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { PatchUserPreferencesDTo } from '../dtos/patch-user-preferences.dto';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';

/**
 * Service class for '/users' controller
 */
@Injectable()
export class UsersService {
    constructor(
        /**
         * Injecting Auth Service 
         */
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,

        /**
         * Injecting usersRepository
         */
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        /**
         * Injecting createUserProvider
         */
        private readonly createUserProvider: CreateUserProvider,

        /**
         * Injecting findOneUserByEmail
         */
        private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider
    ) { }

    public async findAllUsers(getAllUsersParamDto: GetAllUsersParamDto) {

        try {
            const { page = 1, limit = 10 } = getAllUsersParamDto

            const [users, total] = await this.usersRepository.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            if (users.length === 0) {
                return {};
            }

            return {
                total,
                page,
                limit,
                data: users,
            };

        } catch (error) {

            // Todo:Use NestJS logger 
            console.error('Failed to fetch users:', error);

            throw new InternalServerErrorException('Failed to fetch users.');
        }

    }

    public async findOneUser(getOneUserParamDto: GetOneUserParamDto): Promise<User> {
        const { id } = getOneUserParamDto

        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                relations: ['channels'],
            });

            if (!user) {
                throw new NotFoundException('user not found')
            }

            return user
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            }

            // Todo:Use NestJS logger 
            console.error('Error finding user:', error);

            throw new InternalServerErrorException('Failed to find user.');

        }
    }

    public async ceateUser(createUserDto: CreateUserDto): Promise<User> {

        return this.createUserProvider.ceateUser(createUserDto)
    }

    public async patchUser(getOneUserParamDto: GetOneUserParamDto, patchUserDto: PatchUserDto)
        : Promise<{ message: string, user: User }> {

        const { id } = getOneUserParamDto

        try {
            const user = await this.usersRepository.findOne({ where: { id } })

            if (!user) {
                throw new NotFoundException(`user with ${id} not found`)
            }

            Object.assign(user, patchUserDto)
            const updatedUser = await this.usersRepository.save(user);

            return {
                message: `user updated successfully`,
                user: updatedUser,
            };

        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error;
            }

            // Todo:Use NestJS logger 
            console.error('Failed to update user:', error);

            throw new InternalServerErrorException('Failed to update user.');

        }
    }

    public async patchUserPreferences(
        id: string,
        patchUserPreferencesDto: PatchUserPreferencesDTo
    ): Promise<{ message: string, preferences: PatchUserPreferencesDTo }> {

        try {
            const user = await this.usersRepository.findOne({ where: { id } });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} was not found.`);
            }

            user.preferences = {
                ...user.preferences,
                ...patchUserPreferencesDto,
            };

            const updatedUser = await this.usersRepository.save(user);

            return {
                message: 'User preferences updated successfully.',
                preferences: updatedUser.preferences as PatchUserPreferencesDTo
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Todo:Use NestJS logger 
            console.error('Failed to update user preferences:', error);

            throw new InternalServerErrorException(
                'Failed to update user preferences.',
            );
        }
    }

    public async deleteUser(getOneUserParamDto: GetOneUserParamDto): Promise<{ message: string, user: User }> {

        const { id } = getOneUserParamDto;

        try {
            const user = await this.usersRepository.findOne({ where: { id } });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} was not found.`);
            }

            await this.usersRepository.remove(user);

            return {
                message: `user deleted successfully.`,
                user
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Todo:Use NestJS logger
            console.error('Failed to delete user:', error);

            throw new InternalServerErrorException('Failed to delete user. Please try again later.');
        }
    }

    public async findOneUserByEmail(email: string): Promise<User> {

        return this.findOneUserByEmailProvider.findOneByEmail(email)

    }


}
