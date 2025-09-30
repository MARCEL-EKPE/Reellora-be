import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GetAllUsersParamDto } from '../dtos/get-users.dto';
import { GetOneUserParamDto } from '../dtos/get-one-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { PatchUserPreferencesDTo } from '../dtos/patch-user-preferences.dto';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { response } from 'express';

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
        private readonly usersRepository: Repository<User>
    ) { }

    public async findAllUsers(getAllUsersParamDto: GetAllUsersParamDto) {
        this.authService.isAuth()
        const { offset, limit } = getAllUsersParamDto
        return { offset, limit }
    }

    public async findOneUser(getOneUserParamDto: GetOneUserParamDto) {
        const { id } = getOneUserParamDto

        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['channels'],
        });
        if (!user) {
            throw new NotFoundException('user not found')
        }

        return user
    }

    public async ceateUser(createUserDto: CreateUserDto) {
        // check whether user exist with thesame email in the database
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        })
        // handle exception 

        // create new user'
        let newUser = this.usersRepository.create(createUserDto);
        newUser = await this.usersRepository.save(newUser)

        return newUser;
    }

    public async patchUser(getOneUserParamDto: GetOneUserParamDto, patchUserDto: PatchUserDto) {

        const { id } = getOneUserParamDto
        const user = await this.usersRepository.findOne({ where: { id } })

        if (!user) throw new NotFoundException(`user with ${id} not found`)

        Object.assign(user, patchUserDto)

        const updatedUser = await this.usersRepository.save(user);

        return {
            message: `User ${id} updated successfully`,
            user: updatedUser,
        };
    }
    public async patchUserPreferences(
        id: string,
        patchUserPreferencesDto: PatchUserPreferencesDTo
    ) {

        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        user.preferences = {
            ...user.preferences,
            ...patchUserPreferencesDto,
        };

        const updatedUser = await this.usersRepository.save(user);

        return {
            message: 'User preferences updated successfully',
            preferences: updatedUser.preferences,
        };
    }

    public async deleteUser(getOneUserParamDto: GetOneUserParamDto) {

        const { id } = getOneUserParamDto;

        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        await this.usersRepository.remove(user);

        return {
            message: `User with ID ${id} deleted successfully`,
        };
    }
}
