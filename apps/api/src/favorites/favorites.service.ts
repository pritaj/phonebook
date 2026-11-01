import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async findEmployeeIds(userId: number) {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
    });
    return favorites.map((favorite) => favorite.employeeId);
  }

  async add(userId: number, employeeId: number) {
    const employee = await this.employeesRepository.findOneBy({
      id: employeeId,
    });
    if (!employee) {
      throw new NotFoundException(`Employee #${employeeId} not found`);
    }
    const existing = await this.favoritesRepository.findOneBy({
      userId,
      employeeId,
    });
    if (!existing) {
      await this.favoritesRepository.save({ userId, employeeId });
    }
  }

  async remove(userId: number, employeeId: number) {
    await this.favoritesRepository.delete({ userId, employeeId });
  }
}
