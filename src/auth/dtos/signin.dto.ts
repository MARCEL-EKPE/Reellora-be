import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
    @ApiProperty({
        description: "The email address associated with the user's account. Must be a valid email format.",
        example: "johndoe@example.com",
        format: "email",
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: "The password for the user's account. Must match the password set during registration.",
        example: "StrongP@ssw0rd!",
        minLength: 8,
    })
    @IsNotEmpty()
    @IsString()
    password: string;

}