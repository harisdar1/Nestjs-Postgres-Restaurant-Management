import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto, UpdateRoleDto } from './dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>>;
    findOne(id: string): Promise<User>;
    getProfile(userId: string): Promise<User>;
    updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateRole(adminId: string, userId: string, updateRoleDto: UpdateRoleDto): Promise<User>;
    delete(id: string): Promise<void>;
    private sanitizeUser;
}
