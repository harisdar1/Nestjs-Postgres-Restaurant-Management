import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import("../common/enums").UserRole;
            createdAt: Date;
            updatedAt: Date;
            restaurants: import("../restaurants/entities/restaurant.entity").Restaurant[];
            orders: import("../orders/entities/order.entity").Order[];
            reviews: import("../reviews/entities/review.entity").Review[];
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import("../common/enums").UserRole;
            createdAt: Date;
            updatedAt: Date;
            restaurants: import("../restaurants/entities/restaurant.entity").Restaurant[];
            orders: import("../orders/entities/order.entity").Order[];
            reviews: import("../reviews/entities/review.entity").Review[];
        };
        accessToken: string;
    }>;
    private generateToken;
    private sanitizeUser;
}
