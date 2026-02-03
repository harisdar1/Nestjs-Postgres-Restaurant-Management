import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto, UpdateRoleDto } from './dto';
import { UserRole } from '../common/enums';
import { PaginationDto, paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Sanitize passwords
    const sanitizedUsers = users.map((user) => this.sanitizeUser(user));

    return paginate(sanitizedUsers as User[], total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['restaurants', 'orders', 'reviews'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user) as User;
  }

  async getProfile(userId: string): Promise<User> {
    return this.findOne(userId);
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash password if being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return this.sanitizeUser(user) as User;
  }

  async updateRole(
    adminId: string,
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<User> {
    if (adminId === userId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = updateRoleDto.role;
    await this.userRepository.save(user);

    return this.sanitizeUser(user) as User;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
