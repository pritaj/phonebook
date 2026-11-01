import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from './entities/user-preference.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly repository: Repository<UserPreference>,
  ) {}

  async findByUser(userId: number): Promise<UserPreference> {
    const existing = await this.repository.findOneBy({ userId });
    if (existing) {
      return existing;
    }
    return this.repository.save(this.repository.create({ userId }));
  }

  async update(userId: number, language: string): Promise<UserPreference> {
    const preference = await this.findByUser(userId);
    preference.language = language;
    return this.repository.save(preference);
  }
}
