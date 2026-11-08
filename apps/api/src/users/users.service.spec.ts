import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const repositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const existingUser = () => ({
    id: 1,
    username: 'anna',
    passwordHash: 'regi-hash',
    role: 'user',
  });

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('hash-elt jelszóval ment, és nem adja vissza a hash-t', async () => {
      repositoryMock.save.mockImplementation((entity: object) =>
        Promise.resolve({ id: 1, ...entity }),
      );

      const result = await service.create({
        username: 'anna',
        password: 'titkos1234',
        role: 'user',
      });

      const savedArg = repositoryMock.save.mock.calls[0][0] as {
        passwordHash: string;
      };
      expect(savedArg.passwordHash).not.toBe('titkos1234');
      expect(await bcrypt.compare('titkos1234', savedArg.passwordHash)).toBe(
        true,
      );
      expect(result).toEqual({ id: 1, username: 'anna', role: 'user' });
    });
  });

  it('ConflictException-t dob, ha a felhasználónév már foglalt', async () => {
    repositoryMock.findOne.mockResolvedValue(existingUser());

    await expect(
      service.create({
        username: 'anna',
        password: 'titkos1234',
        role: 'user',
      }),
    ).rejects.toThrow(ConflictException);
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  describe('findByUsername', () => {
    it('a teljes entitást adja vissza, a hash-sel együtt (a belépéshez kell)', async () => {
      const user = existingUser();
      repositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findByUsername('anna');

      expect(result).toBe(user);
    });
  });

  describe('findAll', () => {
    it('a felhasználókat hash nélkül adja vissza', async () => {
      repositoryMock.find.mockResolvedValue([existingUser()]);

      const result = await service.findAll();

      expect(result).toEqual([{ id: 1, username: 'anna', role: 'user' }]);
    });
  });

  describe('findOne', () => {
    it('NotFoundException-t dob, ha a felhasználó nem létezik', async () => {
      repositoryMock.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('hash nélkül adja vissza a felhasználót', async () => {
      repositoryMock.findOneBy.mockResolvedValue(existingUser());

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1, username: 'anna', role: 'user' });
    });
  });

  describe('update', () => {
    it('NotFoundException-t dob, ha a felhasználó nem létezik', async () => {
      repositoryMock.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { role: 'admin' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it('szerepkör módosításakor a jelszó hash-e változatlan marad', async () => {
      repositoryMock.findOneBy.mockResolvedValue(existingUser());
      repositoryMock.save.mockImplementation((entity: object) =>
        Promise.resolve(entity),
      );

      const result = await service.update(1, { role: 'admin' });

      expect(repositoryMock.save).toHaveBeenCalledWith({
        id: 1,
        username: 'anna',
        passwordHash: 'regi-hash',
        role: 'admin',
      });
      expect(result).toEqual({ id: 1, username: 'anna', role: 'admin' });
    });

    it('új jelszó esetén újra hash-el', async () => {
      repositoryMock.findOneBy.mockResolvedValue(existingUser());
      repositoryMock.save.mockImplementation((entity: object) =>
        Promise.resolve(entity),
      );

      await service.update(1, { password: 'ujJelszo123' });

      const savedArg = repositoryMock.save.mock.calls[0][0] as {
        passwordHash: string;
      };
      expect(savedArg.passwordHash).not.toBe('regi-hash');
      expect(await bcrypt.compare('ujJelszo123', savedArg.passwordHash)).toBe(
        true,
      );
    });
  });

  describe('remove', () => {
    it('NotFoundException-t dob, ha a felhasználó nem létezik', async () => {
      repositoryMock.findOneBy.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(repositoryMock.remove).not.toHaveBeenCalled();
    });

    it('törli a felhasználót', async () => {
      const user = existingUser();
      repositoryMock.findOneBy.mockResolvedValue(user);

      await service.remove(1);

      expect(repositoryMock.remove).toHaveBeenCalledWith(user);
    });
  });
});
