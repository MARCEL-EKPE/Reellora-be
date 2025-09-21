import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    userName: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
        message: 'Password must be at least 8 characters long, contain at least one letter, one number, and one special character',
    })
    password: string;
}