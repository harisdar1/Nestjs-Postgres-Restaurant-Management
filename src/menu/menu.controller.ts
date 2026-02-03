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
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuFilterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Create menu item (RESTAURANT_OWNER or ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async create(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.menuService.create(createMenuItemDto, user);
  }

  // Get menu items by restaurant (PUBLIC)
  @Get('restaurant/:restaurantId')
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() filterDto: MenuFilterDto,
  ) {
    return this.menuService.findByRestaurant(restaurantId, filterDto);
  }

  // Get categories for a restaurant (PUBLIC - for filter dropdowns)
  @Get('restaurant/:restaurantId/categories')
  async getCategories(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
  ) {
    return this.menuService.getCategories(restaurantId);
  }

  // Get single menu item (PUBLIC)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.findOne(id);
  }

  // Update menu item (OWNER or ADMIN)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.menuService.update(id, updateMenuItemDto, user);
  }

  // Toggle availability (OWNER or ADMIN)
  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async toggleAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.menuService.toggleAvailability(id, user);
  }

  // Delete menu item (OWNER or ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.menuService.delete(id, user);
  }
}
