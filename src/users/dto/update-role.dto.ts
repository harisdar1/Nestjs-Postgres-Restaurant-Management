import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../common/enums';

export class UpdateRoleDto {
  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}
