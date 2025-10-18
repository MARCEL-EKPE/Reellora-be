import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FacebookTokenDto {
    @ApiProperty({ description: 'Authenticate a user via Facebook OAuth' })
    @IsString()
    @IsNotEmpty()
    token: string
}