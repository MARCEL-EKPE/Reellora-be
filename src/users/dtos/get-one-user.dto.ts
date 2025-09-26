import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class GetOneUserParamDto {
    @ApiProperty({
        description: 'UUID string identifier'
    })
    @IsUUID()
    id: string;
}