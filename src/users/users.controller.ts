import { Body, Controller, Delete, Get, Param, Patch, Post, Query, } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetAllUsersParamDto } from './dtos/get-users.dto';
import { GetOneUserParamDto } from './dtos/get-one-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';

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
