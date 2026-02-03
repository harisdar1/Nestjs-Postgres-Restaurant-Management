import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantFilterDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // Create restaurant (RESTAURANT_OWNER or ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.create(createRestaurantDto, user);
  }

  // Get all restaurants (PUBLIC - no auth required)
  @Get()
  async findAll(@Query() filterDto: RestaurantFilterDto) {
    return this.restaurantsService.findAll(filterDto);
  }

  // Get own restaurants (RESTAURANT_OWNER)
  @Get('my-restaurants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async findMyRestaurants(@CurrentUser() user: User) {
    return this.restaurantsService.findByOwner(user.id);
  }

  // Get single restaurant (PUBLIC)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.findOne(id);
  }

  // Update restaurant (OWNER or ADMIN)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto, user);
  }

  // Toggle open/closed status (OWNER or ADMIN)
  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.toggleStatus(id, user);
  }

  // Delete restaurant (OWNER or ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.delete(id, user);
  }
}
