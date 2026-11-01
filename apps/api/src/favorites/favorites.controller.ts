import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';

type RequestWithUser = { user: { userId: number } };

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.favoritesService.findEmployeeIds(req.user.userId);
  }

  @Post(':employeeId')
  async add(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Req() req: RequestWithUser,
  ) {
    await this.favoritesService.add(req.user.userId, employeeId);
  }

  @Delete(':employeeId')
  async remove(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Req() req: RequestWithUser,
  ) {
    await this.favoritesService.remove(req.user.userId, employeeId);
  }
}
