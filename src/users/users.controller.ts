import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetAllUsersParamDto } from './dtos/get-users.dto';
import { GetOneUserParamDto } from './dtos/get-one-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';
import { PatchUserPreferencesDTo } from './dtos/patch-user-preferences.dto';

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
        @Req() req: Request,
        @Body() patchUserPreferencesDto: PatchUserPreferencesDTo
    ) {
        //TODO: get authenticated user id form req.user.id
        return this.usersService.patchUserPreferences('b229f0df-4a5f-4999-b996-e30141424235', patchUserPreferencesDto)
    }

    @Patch(':id')
    public patchUser(
        @Param() getOneUserParamDto: GetOneUserParamDto,
        @Body() patchUserDto: PatchUserDto
    ) {
        return this.usersService.patchUser(getOneUserParamDto, patchUserDto)
    }

    @Delete(':id')
    public deleteUser(@Param() getOneUserParamDto: GetOneUserParamDto) {
        return this.usersService.deleteUser(getOneUserParamDto)
    }
}
