import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GetAllUsersParamDto } from '../dtos/get-users.dto';
import { GetOneUserParamDto } from '../dtos/get-one-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { PatchUserPreferencesDTo } from '../dtos/patch-user-preferences.dto';

@Injectable()
export class UsersService {
    constructor(
        /**
         * Injecting Auth Service 
         */
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) { }

    public async findAllUsers(getAllUsersParamDto: GetAllUsersParamDto) {
        this.authService.isAuth()
        const { offset, limit } = getAllUsersParamDto
        return { offset, limit }
    }

    public async findOneUser(getOneUserParamDto: GetOneUserParamDto) {
        const { id } = getOneUserParamDto
        return { message: `user with ID ${id}` }
    }

    public async ceateUser(createUserDto: CreateUserDto) {
        return {
            body: createUserDto
        }
    }

    public async patchUser(getOneUserParamDto: GetOneUserParamDto, patchUserDto: PatchUserDto) {
        return {
            message: `User ${getOneUserParamDto.id} updated successfully`,
            updates: patchUserDto,
        }
    }
    public async patchUserPreferences(patchUserPreferencesDto: PatchUserPreferencesDTo) {
        return {
            message: 'User preferences updated successfully',
            updates: patchUserPreferencesDto,
        }
    }

    public async deleteUser(getOneUserParamDto: GetOneUserParamDto) {
        return `user with ${getOneUserParamDto.id} deleted`
    }
}
