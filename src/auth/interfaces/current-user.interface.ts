import { UserRole } from "src/users/enums/user-role.enum"

export interface CurrentUser {
    // Id of the user 
    sub: string
    // email of the user 
    email: string

    // email of the user 
    role: UserRole
}