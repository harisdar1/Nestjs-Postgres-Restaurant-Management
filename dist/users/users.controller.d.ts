import { UsersService } from './users.service';
import { UpdateUserDto, UpdateRoleDto } from './dto';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<User>>;
    getProfile(user: User): Promise<User>;
    updateProfile(user: User, updateUserDto: UpdateUserDto): Promise<User>;
    findOne(id: string): Promise<User>;
    updateRole(admin: User, id: string, updateRoleDto: UpdateRoleDto): Promise<User>;
    delete(id: string): Promise<void>;
}
