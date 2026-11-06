import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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

  async findTree(isAuthenticated: boolean) {
    const departments = await this.departmentsRepository.find({
      relations: { employees: true },
      select: isAuthenticated
        ? undefined
        : {
            id: true,
            nameHu: true,
            nameEn: true,
            parentId: true,
            employees: {
              id: true,
              lastName: true,
              firstName: true,
              position: true,
              departmentId: true,
            },
          },
    });
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
        if (parent) {
          parent.children.push(department);
        }
      }
    });
    return roots;
  }

  async findOne(id: number) {
    const department = await this.departmentsRepository.findOneBy({ id });
    if (!department) {
      throw new NotFoundException(`Department #${id} not found`);
    }
    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    if (updateDepartmentDto.parentId === id) {
      throw new BadRequestException('A department cannot be its own parent');
    }
    Object.assign(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async remove(id: number) {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: { employees: true, children: true },
    });
    if (!department) {
      throw new NotFoundException(`Department #${id} not found`);
    }
    if (department.employees.length > 0 || department.children.length > 0) {
      throw new ConflictException(
        'A department with employees or sub-departments cannot be deleted',
      );
    }
    await this.departmentsRepository.remove(department);
  }
}
