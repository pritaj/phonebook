import { Controller, Get, Query } from '@nestjs/common';
import { SisService } from './sis.service';

@Controller('sis')
export class SisController {
  constructor(private readonly sisService: SisService) {}

  @Get()
  async getDepartments(@Query('areaId') areaId: string) {
    const areaIdNumber = Number(areaId);
    return this.sisService.getDepartmentTree(areaIdNumber);
  }
}
