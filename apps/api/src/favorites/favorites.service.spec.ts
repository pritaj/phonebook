import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const favoritesRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const employeesRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: favoritesRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: employeesRepository,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('a kedvencek munkatárs-azonosítóit adja vissza', async () => {
    favoritesRepository.find.mockResolvedValue([
      { employeeId: 3 },
      { employeeId: 8 },
    ]);

    const result = await service.findEmployeeIds(1);

    expect(result).toEqual([3, 8]);
  });

  it('hozzáadáskor menti az új kedvencet', async () => {
    employeesRepository.findOneBy.mockResolvedValue({ id: 3 });
    favoritesRepository.findOneBy.mockResolvedValue(null);

    await service.add(1, 3);

    expect(favoritesRepository.save).toHaveBeenCalledWith({
      userId: 1,
      employeeId: 3,
    });
  });

  it('nem menti újra, ha már kedvenc', async () => {
    employeesRepository.findOneBy.mockResolvedValue({ id: 3 });
    favoritesRepository.findOneBy.mockResolvedValue({ id: 1 });

    await service.add(1, 3);

    expect(favoritesRepository.save).not.toHaveBeenCalled();
  });

  it('nem létező munkatársnál hibát dob', async () => {
    employeesRepository.findOneBy.mockResolvedValue(null);

    await expect(service.add(1, 999)).rejects.toThrow(NotFoundException);
  });
});
