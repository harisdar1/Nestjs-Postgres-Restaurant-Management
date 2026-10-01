# Restaurant Management API

A full-featured restaurant management and ordering system built with **NestJS**. This backend API demonstrates enterprise-grade patterns including JWT authentication, role-based access control, database transactions, state machine patterns, and a clean modular architecture.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Design Patterns](#design-patterns)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [What I Learned](#what-i-learned)

---

## Features

- **Multi-Tenant Restaurant Management** - Support for multiple restaurants with individual owners
- **User Role System** - Three roles: Customer, Restaurant Owner, Admin
- **Complete Order Lifecycle** - From placement to delivery with status tracking
- **Menu Management** - Categories, pricing, availability toggles
- **Review & Rating System** - Customer reviews tied to delivered orders
- **JWT Authentication** - Stateless token-based auth with Passport.js
- **Role-Based Access Control** - Fine-grained permissions via guards
- **Rate Limiting** - Multi-tier throttling to prevent abuse
- **Database Transactions** - Atomic operations for data integrity
- **Price Snapshots** - Historical pricing preserved on orders
- **Global Exception Handling** - Standardized error responses
- **Input Validation** - Comprehensive DTO validation with class-validator

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| NestJS 11 | Node.js framework with TypeScript |
| TypeORM | Database ORM with migrations |
| PostgreSQL | Relational database |
| Passport.js | Authentication middleware |
| JWT | Stateless authentication tokens |
| bcrypt | Password hashing (10 salt rounds) |
| class-validator | DTO validation decorators |
| class-transformer | Payload transformation |
| @nestjs/throttler | Multi-tier rate limiting |
| @nestjs/config | Environment configuration |

---

## Project Structure

```
src/
├── main.ts                    # Entry point + global pipes/filters
├── app.module.ts              # Root module configuration
│
├── auth/                      # Authentication module
│   ├── auth.controller.ts     # Login & register endpoints
│   ├── auth.service.ts        # JWT generation, password validation
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts    # Passport JWT strategy
│   └── guards/
│       ├── jwt-auth.guard.ts  # Token validation
│       └── roles.guard.ts     # Role-based access
│
├── users/                     # User management module
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── update-user.dto.ts
│       └── update-role.dto.ts
│
├── restaurants/               # Restaurant management module
│   ├── restaurants.controller.ts
│   ├── restaurants.service.ts
│   ├── restaurants.module.ts
│   ├── entities/
│   │   └── restaurant.entity.ts
│   └── dto/
│       ├── create-restaurant.dto.ts
│       ├── update-restaurant.dto.ts
│       └── restaurant-filter.dto.ts
│
├── menu/                      # Menu items module
│   ├── menu.controller.ts
│   ├── menu.service.ts
│   ├── menu.module.ts
│   ├── entities/
│   │   └── menu-item.entity.ts
│   └── dto/
│       ├── create-menu-item.dto.ts
│       ├── update-menu-item.dto.ts
│       └── menu-filter.dto.ts
│
├── orders/                    # Order management module
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.module.ts
│   ├── entities/
│   │   ├── order.entity.ts
│   │   └── order-item.entity.ts
│   └── dto/
│       ├── create-order.dto.ts
│       ├── update-order-status.dto.ts
│       └── order-filter.dto.ts
│
├── reviews/                   # Reviews & ratings module
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   ├── reviews.module.ts
│   ├── entities/
│   │   └── review.entity.ts
│   └── dto/
│       ├── create-review.dto.ts
│       └── update-review.dto.ts
│
└── common/                    # Shared utilities
    ├── decorators/
    │   ├── roles.decorator.ts
    │   └── current-user.decorator.ts
    ├── dto/
    │   └── pagination.dto.ts
    ├── enums/
    │   ├── user-role.enum.ts
    │   └── order-status.enum.ts
    └── filters/
        └── all-exceptions.filter.ts
```

---

## Architecture

### Module System

```
AppModule (Root)
    ├── ConfigModule        → Environment variables
    ├── ThrottlerModule     → Rate limiting (3 tiers)
    ├── TypeOrmModule       → PostgreSQL connection
    ├── AuthModule          → JWT authentication
    ├── UsersModule         → User management
    ├── RestaurantsModule   → Restaurant CRUD
    ├── MenuModule          → Menu items CRUD
    ├── OrdersModule        → Order lifecycle
    └── ReviewsModule       → Ratings & reviews
```

### Request Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│  Rate Limiter   │ ← ThrottlerGuard (3 req/s, 20/10s, 100/min)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ValidationPipe  │ ← Validates DTOs, strips unknown fields
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JwtAuthGuard   │ ← Validates Bearer token (protected routes)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RolesGuard    │ ← Checks user role permissions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │ ← HTTP layer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │ ← Business logic + ownership checks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │ ← TypeORM database operations
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ ExceptionFilter │ ← Standardized error responses
└─────────────────┘
```

### User Roles

| Role | Permissions |
|------|-------------|
| `USER` | Browse restaurants, place orders, write reviews |
| `RESTAURANT_OWNER` | Manage own restaurants, menus, view orders |
| `ADMIN` | Full system access, manage all users |

---

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/api/auth/register` | Create new user | No | 3/min |
| POST | `/api/auth/login` | Get JWT token | No | 5/min |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | List all users | ADMIN |
| GET | `/api/users/profile` | Get own profile | JWT |
| PATCH | `/api/users/profile` | Update own profile | JWT |
| GET | `/api/users/:id` | Get user by ID | ADMIN |
| PATCH | `/api/users/:id/role` | Update user role | ADMIN |
| DELETE | `/api/users/:id` | Delete user | ADMIN |

### Restaurants

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/restaurants` | Create restaurant | OWNER/ADMIN |
| GET | `/api/restaurants` | List restaurants | Public |
| GET | `/api/restaurants/my-restaurants` | Get own restaurants | OWNER/ADMIN |
| GET | `/api/restaurants/:id` | Get single restaurant | Public |
| PATCH | `/api/restaurants/:id` | Update restaurant | Owner/ADMIN |
| PATCH | `/api/restaurants/:id/toggle-status` | Toggle open/closed | Owner/ADMIN |
| DELETE | `/api/restaurants/:id` | Delete restaurant | Owner/ADMIN |

### Menu Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/menu` | Create menu item | OWNER/ADMIN |
| GET | `/api/menu/restaurant/:id` | Get restaurant menu | Public |
| GET | `/api/menu/restaurant/:id/categories` | Get menu categories | Public |
| GET | `/api/menu/:id` | Get single item | Public |
| PATCH | `/api/menu/:id` | Update item | Owner/ADMIN |
| PATCH | `/api/menu/:id/toggle-availability` | Toggle availability | Owner/ADMIN |
| DELETE | `/api/menu/:id` | Delete item | Owner/ADMIN |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | JWT |
| GET | `/api/orders/my-orders` | Get own orders | JWT |
| GET | `/api/orders/restaurant/:id` | Get restaurant orders | Owner/ADMIN |
| GET | `/api/orders/:id` | Get single order | JWT |
| PATCH | `/api/orders/:id/status` | Update order status | Owner/ADMIN |
| PATCH | `/api/orders/:id/cancel` | Cancel order | JWT |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reviews` | Create review | JWT |
| GET | `/api/reviews/restaurant/:id` | Get restaurant reviews | Public |
| GET | `/api/reviews/:id` | Get single review | Public |
| PATCH | `/api/reviews/:id` | Update review | Author/ADMIN |
| DELETE | `/api/reviews/:id` | Delete review | Author/ADMIN |

---

## Database Schema

```
┌─────────────────┐       ┌─────────────────┐
│      USER       │       │   RESTAURANT    │
├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │
│ email (unique)  │──┐    │ name            │
│ password (hash) │  │    │ description     │
│ name            │  │    │ address         │
│ phone           │  │    │ phone           │
│ role (enum)     │  │    │ isOpen          │
│ createdAt       │  │    │ averageRating   │
│ updatedAt       │  │    │ totalReviews    │
└─────────────────┘  │    │ ownerId (FK)  ◀─┘
                     │    │ createdAt       │
                     │    │ updatedAt       │
                     │    └────────┬────────┘
                     │             │
                     │             │ OneToMany
                     │             ▼
                     │    ┌─────────────────┐
                     │    │   MENU_ITEM     │
                     │    ├─────────────────┤
                     │    │ id (UUID) PK    │
                     │    │ name            │
                     │    │ description     │
                     │    │ price (decimal) │
                     │    │ category        │
                     │    │ imageUrl        │
                     │    │ isAvailable     │
                     │    │ restaurantId FK │
                     │    └─────────────────┘
                     │
┌─────────────────┐  │    ┌─────────────────┐
│     ORDER       │  │    │   ORDER_ITEM    │
├─────────────────┤  │    ├─────────────────┤
│ id (UUID) PK    │  │    │ id (UUID) PK    │
│ status (enum)   │◀─┼────│ orderId (FK)    │
│ totalAmount     │  │    │ menuItemId      │
│ deliveryAddress │  │    │ name (snapshot) │
│ notes           │  │    │ price (snapshot)│
│ userId (FK)   ◀─┼──┘    │ quantity        │
│ restaurantId FK │       │ subtotal        │
│ createdAt       │       └─────────────────┘
│ updatedAt       │
└────────┬────────┘
         │
         │ OneToOne
         ▼
┌─────────────────┐
│     REVIEW      │
├─────────────────┤
│ id (UUID) PK    │
│ rating (1-5)    │
│ comment         │
│ userId (FK)     │
│ restaurantId FK │
│ orderId (FK) UQ │ ← One review per order
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### Order Status Lifecycle

```
PENDING ──────▶ CONFIRMED ──────▶ PREPARING ──────▶ READY ──────▶ DELIVERED
    │              │                  │               │
    │              │                  │               │
    └──────────────┴──────────────────┴───────────────┴──────────▶ CANCELLED
```

> **State Machine:** Invalid transitions throw `BadRequestException`. Terminal states (DELIVERED, CANCELLED) cannot transition.

---

## Security Features

### 1. Password Hashing

```typescript
@BeforeInsert()
async hashPassword() {
  this.password = await bcrypt.hash(this.password, 10);
}
```

Passwords are hashed with bcrypt (10 salt rounds) before storage.

### 2. JWT Authentication

```
┌──────────┐     Login       ┌──────────┐
│  Client  │ ───────────────▶│  Server  │
└──────────┘  email/pass     └──────────┘
                                   │
                                   │ Validate & generate JWT
                                   ▼
┌──────────┐    Token        ┌──────────┐
│  Client  │ ◀───────────────│  Server  │
└──────────┘                 └──────────┘
      │
      │ Protected Request
      │ Authorization: Bearer <token>
      ▼
┌──────────┐                 ┌──────────┐
│  Client  │ ───────────────▶│  Server  │
└──────────┘                 └──────────┘
                                   │
                                   │ Validate token → Extract user
                                   ▼
                              Allow/Deny
```

### 3. Multi-Tier Rate Limiting

```typescript
ThrottlerModule.forRoot([
  { ttl: 1000, limit: 3 },      // 3 requests/second
  { ttl: 10000, limit: 20 },    // 20 requests/10 seconds
  { ttl: 60000, limit: 100 },   // 100 requests/minute
])

// Endpoint-specific limits
@Throttle({ default: { ttl: 60000, limit: 5 } })  // 5 login attempts/min
async login() { }
```

### 4. Input Validation

All incoming data is validated before processing:

```typescript
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}
```

### 5. Ownership Verification

```typescript
private checkOwnership(restaurant: Restaurant, user: User): void {
  if (user.role === UserRole.ADMIN) return;

  if (restaurant.ownerId !== user.id) {
    throw new ForbiddenException('You can only modify your own resources');
  }
}
```

---

## Design Patterns

### 1. Price Snapshot Pattern

**Problem:** Menu prices change over time, but order history must reflect original prices.

**Solution:** Copy prices at order creation:

```typescript
const orderItem = {
  menuItemId: item.id,
  name: item.name,        // Snapshot
  price: item.price,      // Snapshot - frozen at order time
  quantity: qty,
  subtotal: item.price * qty
};
```

### 2. State Machine Pattern

Valid order status transitions are enforced:

```typescript
const ALLOWED_TRANSITIONS = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};
```

### 3. Database Transactions

Atomic order creation with rollback on failure:

```typescript
const queryRunner = dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
  const order = await queryRunner.manager.save(Order, orderData);
  await queryRunner.manager.save(OrderItem, items);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

### 4. Pagination Pattern

Standardized across all list endpoints:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/harisdar1/Nestjs-Postgres-Restaurant-Management.git
cd Nestjs-Postgres-Restaurant-Management

# Install dependencies
npm install

# Create PostgreSQL database
createdb restaurant_db

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Run development server
npm run start:dev
```

### Available Scripts

```bash
npm run start          # Production mode
npm run start:dev      # Development with hot reload
npm run start:debug    # Debug mode
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
npm run test:cov       # Test coverage report
npm run lint           # ESLint
npm run format         # Prettier
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=restaurant_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# Server
PORT=3000
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## What I Learned

### Backend Architecture
- **NestJS Modules** - Organizing code into feature modules with proper dependency injection
- **TypeORM Relations** - OneToMany, ManyToOne, OneToOne relationships with cascading
- **Guards & Decorators** - Custom authentication and authorization patterns
- **Global Pipes & Filters** - Centralized validation and error handling

### Security
- **JWT Authentication** - Token generation, validation, and payload management
- **Role-Based Access** - Implementing RBAC with guards and metadata
- **Rate Limiting** - Multi-tier throttling to prevent brute force attacks
- **Password Security** - bcrypt hashing with proper salt rounds

### Database Patterns
- **Transactions** - Ensuring data integrity with atomic operations
- **Price Snapshots** - Preserving historical data for audit trails
- **State Machines** - Managing entity lifecycle with valid transitions
- **Pagination** - Efficient data retrieval with metadata

### API Design
- **RESTful Principles** - Resource-based URLs, proper HTTP methods
- **DTO Validation** - Input sanitization and type transformation
- **Error Handling** - Consistent error response format
- **Documentation** - Self-documenting code with clear structure

---

## Future Improvements

- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement refresh tokens
- [ ] Add image upload for menu items
- [ ] Real-time order updates with WebSockets
- [ ] Search with Elasticsearch
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Unit & integration test coverage

---

## License

This project is for educational purposes.

---

<p align="center">
  Built with NestJS
</p>
