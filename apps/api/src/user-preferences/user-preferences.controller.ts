import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

type RequestWithUser = { user: { userId: number } };

@Controller('user-preferences')
@UseGuards(AuthGuard('jwt'))
export class UserPreferencesController {
  constructor(private readonly service: UserPreferencesService) {}

  @Get()
  findMine(@Req() req: RequestWithUser) {
    return this.service.findByUser(req.user.userId);
  }

  @Put()
  updateMine(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserPreferenceDto,
  ) {
    return this.service.update(req.user.userId, dto.language);
  }
}
