import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetAllUsersParamDto } from './dtos/get-users.dto';
import { GetOneUserParamDto } from './dtos/get-one-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';
import { PatchUserPreferencesDTo } from './dtos/patch-user-preferences.dto';
import { CurrentUserData } from 'src/auth/decorators/current-user-data.decorator';
import { type CurrentUser } from 'src/auth/interfaces/current-user.interface';

@Controller('users')
export class UsersController {
    constructor(
        /**
         * injecting usersService as a dependency
         */
        private readonly usersService: UsersService

    ) { }

    @Get()
    public findAllUsers(@Query() getAllUsersParamDto: GetAllUsersParamDto) {
        return this.usersService.findAllUsers(getAllUsersParamDto)
    }

    @Get(':id')
    public findOneUser(@Param() getOneUserParamDto: GetOneUserParamDto) {
        return this.usersService.findOneUser(getOneUserParamDto)
    }

    @Post()
    public createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.ceateUser(createUserDto)
    }

    @Patch('preferences')
    public patchUserPreferences(
        @CurrentUserData() user: CurrentUser,
        @Body() patchUserPreferencesDto: PatchUserPreferencesDTo
    ) {
        return this.usersService.patchUserPreferences(user.sub, patchUserPreferencesDto)
    }

    @Patch('me')
    public patchUser(
        @CurrentUserData() user: CurrentUser,
        @Body() patchUserDto: PatchUserDto
    ) {
        return this.usersService.patchUser(user.sub, patchUserDto)
    }

    @Delete(':id')
    public deleteUser(@Param() getOneUserParamDto: GetOneUserParamDto) {
        return this.usersService.deleteUser(getOneUserParamDto)
    }
}
