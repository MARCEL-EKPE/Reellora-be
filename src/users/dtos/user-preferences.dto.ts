import { IsNumber, Min, Max, IsBoolean, IsEnum } from "class-validator";
import { ReplyTone } from "../enums/replyTone.enums";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UserPreferencesDto {
    @ApiPropertyOptional({ example: 3, description: 'Number of uploads per day' })
    @IsNumber()
    @Min(0)
    @Max(3)
    frequencyOfUpload: number;

    @ApiPropertyOptional({ example: true, description: 'Whether to auto-post content' })
    @IsBoolean()
    autoPost: boolean;

    @ApiPropertyOptional({
        enum: ReplyTone,
        example: ReplyTone.PROFESSIONAL,
        description: 'Tone for replies in generated responses',
    })
    @IsEnum(ReplyTone, { message: 'replyTone must be one of: PROFESSIONAL, WITTY, HUMOROUS' })
    replyTone: ReplyTone;

}