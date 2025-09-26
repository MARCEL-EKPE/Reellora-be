import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength, ValidateNested } from "class-validator";
import { UserPreferencesDto } from "./user-preferences.dto";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    userName: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
        message: 'Password must be at least 8 characters long, contain at least one letter, one number, and one special character',
    })
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UserPreferencesDto)
    preferences?: UserPreferencesDto
}