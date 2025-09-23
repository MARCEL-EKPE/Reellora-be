import { Injectable } from '@nestjs/common';
import { GetAllUsersParamDto } from '../dtos/get-users.dto';
import { GetOneUserParamDto } from '../dtos/get-one-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user.dto';

@Injectable()
export class UsersService {

    public async findAllUsers(getAllUsersParamDto: GetAllUsersParamDto) {
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

    public async deleteUser(getOneUserParamDto: GetOneUserParamDto) {
        return `user with ${getOneUserParamDto.id} deleted`
    }
}
