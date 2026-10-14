import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsRepository.save(createDepartmentDto);
  }

  findAll() {
    return this.departmentsRepository.find();
  }

  async findTree() {
    const departments = await this.departmentsRepository.find();
    const byId = new Map<number, Department>();
    departments.forEach((department) => {
      department.children = [];
      byId.set(department.id, department);
    });
    const roots: Department[] = [];
    departments.forEach((department) => {
      if (department.parentId === null) {
        roots.push(department);
      } else {
        const parent = byId.get(department.parentId);
        if(parent) {
          parent.children.push(department);
        }
      }
    });
    return roots;
  }

  findOne(id: number) {
    return `This action returns a #${id} department`;
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }
}
