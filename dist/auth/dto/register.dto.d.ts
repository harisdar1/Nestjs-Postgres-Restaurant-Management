import { UserRole } from '../../common/enums';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: UserRole;
}
