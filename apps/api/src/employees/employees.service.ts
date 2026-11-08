import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.saveEmployee(createEmployeeDto);
  }

  findAll() {
    return this.employeesRepository.find();
  }

  async findOne(id: number) {
    const employee = await this.employeesRepository.findOneBy({ id });
    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return this.saveEmployee(employee);
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
  }

  private async saveEmployee(employee: DeepPartial<Employee>) {
    try {
      return await this.employeesRepository.save(employee);
    } catch (error) {
      const code = (error as { driverError?: { code?: string } }).driverError
        ?.code;
      if (error instanceof QueryFailedError && code === '23503') {
        throw new BadRequestException('Department does not exist');
      }
      throw error;
    }
  }
}
