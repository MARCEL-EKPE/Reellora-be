import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GoogleTokenDto {
    @ApiProperty({ description: 'Authenticate a user via Google OAuth' })
    @IsString()
    @IsNotEmpty()
    token: string
}