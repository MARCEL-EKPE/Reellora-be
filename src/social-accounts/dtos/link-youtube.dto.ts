import { IsString } from "class-validator";

export class LinkYoutubeDto {
    @IsString()
    code: string; // OAuth code returned from Google
}