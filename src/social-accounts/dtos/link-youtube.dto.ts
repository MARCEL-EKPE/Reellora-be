import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LinkYoutubeDto {
    @ApiProperty({ description: 'OAuth code returned from Google' })
    @IsString()
    code: string;
}