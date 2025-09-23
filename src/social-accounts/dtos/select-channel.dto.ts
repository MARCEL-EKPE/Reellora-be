import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { Niche } from "../enums/niche.enums"

export class SelectChannelDto {
    @IsString()
    @IsNotEmpty()
    channelId: string;

    @IsString()
    @IsNotEmpty()
    channelName: string;

    @IsEnum(Niche)
    niche: Niche;
}