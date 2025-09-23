import { Type } from "class-transformer";
import { IsInt, IsOptional, Min, } from "class-validator";

export class GetAllUsersParamDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    offset?: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}