import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Min, } from "class-validator";

export class GetAllUsersParamDto {
    @ApiPropertyOptional({ description: 'Page number (default: 1)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1

    @ApiPropertyOptional({ description: 'Items per page (default: 10)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number = 10;
}