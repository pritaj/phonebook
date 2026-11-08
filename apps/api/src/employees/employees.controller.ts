import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditService } from '../audit/audit.service';

type RequestWithUser = { user: { username: string } };

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly auditService: AuditService,
  ) {}

  @Roles('admin')
  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: RequestWithUser,
  ) {
    const employee = await this.employeesService.create(createEmployeeDto);
    await this.auditService.log(
      req.user.username,
      'CREATE',
      'Employee',
      employee.id,
      `${employee.lastName} ${employee.firstName}`,
    );
    return employee;
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(+id);
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: RequestWithUser,
  ) {
    const employee = await this.employeesService.update(+id, updateEmployeeDto);
    await this.auditService.log(
      req.user.username,
      'UPDATE',
      'Employee',
      employee.id,
      `${employee.lastName} ${employee.firstName}`,
    );
    return employee;
  }

  @Roles('admin')
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const employee = await this.employeesService.findOne(+id);
    await this.employeesService.remove(+id);
    await this.auditService.log(
      req.user.username,
      'DELETE',
      'Employee',
      employee.id,
      `${employee.lastName} ${employee.firstName}`,
    );
  }
}
