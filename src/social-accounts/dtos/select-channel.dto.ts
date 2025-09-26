import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { Niche } from "../enums/niche.enums"
import { ApiProperty } from "@nestjs/swagger";

export class SelectChannelDto {
    @ApiProperty({
        description: "The unique identifier of the selected social media channel (provided by the platform).",
        example: "UC_x5XG1OV2P6uZZ5FSM9Ttw"
    })
    @IsString()
    @IsNotEmpty()
    channelId: string;

    @ApiProperty({
        description: "The display name of the selected social media channel.",
        example: "Tech World"
    })
    @IsString()
    @IsNotEmpty()
    channelName: string;

    @ApiProperty({
        description: "The niche or category this channel belongs to. Must match one of the predefined niche enum values.",
        enum: Niche,
        example: Niche.NEWS
    })
    @IsEnum(Niche, { message: 'Niche must be a valid value from the Niche enum.' })
    niche: Niche;
}