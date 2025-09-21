import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
    @Get()
    public findAllUsers(
        @Query('offset', new DefaultValuePipe(1), ParseIntPipe) offset: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        return {
            offset,
            limit
        }
    }

    @Get(':id')
    public findOneUser(@Param('id', ParseIntPipe) id: number) {
        return {
            message: `user with ID ${id}`,
        }

    }

    @Post()
    public createUsers(@Body() creatUserDto: CreateUserDto) {
        return {
            body: creatUserDto
        }
    }

    @Patch(':id')
    public updateUser(
        @Param('id') id: string,
        @Body() body: any
    ) {
        return {
            message: `User ${id} updated successfully`,
            updates: body,
        }
    }

    @Delete(':id')
    public deleteUser(@Param('id') id: string) {
        return `user with ${id} deleted`
    }
}
