import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  const repositoryMock = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getRepositoryToken(Department), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('NotFoundException-t dob, ha az osztály nem létezik', async () => {
      repositoryMock.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('visszaadja az osztályt, ha létezik', async () => {
      const department = { id: 1, nameHu: 'Informatika' };
      repositoryMock.findOneBy.mockResolvedValue(department);

      const result = await service.findOne(1);

      expect(result).toBe(department);
    });
  });

  describe('update', () => {
    it('NotFoundException-t dob, ha az osztály nem létezik', async () => {
      repositoryMock.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { nameHu: 'Új név' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it('BadRequestException-t dob, ha az osztály a saját szülője lenne', async () => {
      repositoryMock.findOneBy.mockResolvedValue({
        id: 1,
        nameHu: 'Informatika',
      });

      await expect(service.update(1, { parentId: 1 })).rejects.toThrow(
        BadRequestException,
      );
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it('elmenti a módosított osztályt', async () => {
      repositoryMock.findOneBy.mockResolvedValue({
        id: 1,
        nameHu: 'Informatika',
      });
      repositoryMock.save.mockImplementation((entity: unknown) =>
        Promise.resolve(entity),
      );

      const result = await service.update(1, { nameHu: 'IT osztály' });

      expect(repositoryMock.save).toHaveBeenCalledWith({
        id: 1,
        nameHu: 'IT osztály',
      });
      expect(result).toEqual({ id: 1, nameHu: 'IT osztály' });
    });
  });

  describe('remove', () => {
    it('NotFoundException-t dob, ha az osztály nem létezik', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(repositoryMock.remove).not.toHaveBeenCalled();
    });

    it('ConflictException-t dob, ha az osztálynak vannak dolgozói', async () => {
      repositoryMock.findOne.mockResolvedValue({
        id: 1,
        employees: [{ id: 10 }],
        children: [],
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repositoryMock.remove).not.toHaveBeenCalled();
    });

    it('ConflictException-t dob, ha az osztálynak vannak alosztályai', async () => {
      repositoryMock.findOne.mockResolvedValue({
        id: 1,
        employees: [],
        children: [{ id: 2 }],
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repositoryMock.remove).not.toHaveBeenCalled();
    });

    it('törli az üres osztályt', async () => {
      const department = { id: 1, employees: [], children: [] };
      repositoryMock.findOne.mockResolvedValue(department);

      await service.remove(1);

      expect(repositoryMock.remove).toHaveBeenCalledWith(department);
    });
  });
});
