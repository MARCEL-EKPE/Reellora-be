import { IsUUID } from "class-validator";

export class GetOneUserParamDto {
    @IsUUID()
    id: string;
}