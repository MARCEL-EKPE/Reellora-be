import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GoogleTokenDto {
    @ApiProperty({ description: 'Token sent from google to authenticate user' })
    @IsString()
    @IsNotEmpty()
    token: string
}