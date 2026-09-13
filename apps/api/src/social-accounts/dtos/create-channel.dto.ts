import { IsEnum, IsNotEmpty, IsString, IsNumber } from "class-validator";
import { Niche } from "../enums/niche.enums";
import { ApiProperty } from "@nestjs/swagger";
import { Platform } from "../enums/platform.enums";

export class CreateChannelDto {
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
        description: "Profile image / thumbnail of the channel.",
        example: "https://yt3.googleusercontent.com/abcd1234-profile.jpg"
    })
    @IsString()
    @IsNotEmpty()
    thumbnail: string;

    @ApiProperty({
        description: "OAuth access token used to authenticate requests for the channel.",
        example: "ya29.a0AfH6SMC...."
    })
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({
        description: "OAuth refresh token used to generate new access tokens.",
        example: "1//0gdfgg8744..."
    })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    @ApiProperty({
        description: "Expiration timestamp (in milliseconds) of the current access token.",
        example: 1738643200000
    })
    @IsNumber()
    @IsNotEmpty()
    tokenExpiry: number;

    @ApiProperty({
        description: "The niche or category this channel belongs to. Must match one of the predefined niche enum values.",
        enum: Niche,
        example: Niche.NEWS
    })
    @IsEnum(Niche, { message: 'Niche must be a valid value from the Niche enum.' })
    niche: Niche;

    @ApiProperty({
        description: "The Platform or category this channel belongs to. Must match one of the predefined Platform enum values.",
        enum: Platform,
        example: Platform.YOUTUBE
    })
    @IsEnum(Platform, { message: 'Platform must be a valid value from the Platform enum.' })
    platform: Platform;
}