import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
