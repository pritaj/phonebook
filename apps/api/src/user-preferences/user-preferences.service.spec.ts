import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreference } from './entities/user-preference.entity';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  const repository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        { provide: getRepositoryToken(UserPreference), useValue: repository },
      ],
    }).compile();
    service = module.get(UserPreferencesService);
  });

  it('visszaadja a meglévő beállítást', async () => {
    const existing = { id: 1, userId: 5, language: 'en-US' };
    repository.findOneBy.mockResolvedValue(existing);

    const result = await service.findByUser(5);

    expect(result).toBe(existing);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('alapértelmezett beállítást hoz létre, ha még nincs', async () => {
    repository.findOneBy.mockResolvedValue(null);
    repository.create.mockReturnValue({ userId: 5 });
    repository.save.mockResolvedValue({ id: 1, userId: 5, language: 'hu-HU' });

    const result = await service.findByUser(5);

    expect(repository.create).toHaveBeenCalledWith({ userId: 5 });
    expect(result.language).toBe('hu-HU');
  });

  it('módosítja a nyelvet', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      userId: 5,
      language: 'hu-HU',
    });
    repository.save.mockImplementation((pref: UserPreference) =>
      Promise.resolve(pref),
    );

    const result = await service.update(5, 'en-US');

    expect(result.language).toBe('en-US');
  });
});
