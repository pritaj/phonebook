import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.findByUsername(createUserDto.username);
    if (existing) {
      throw new ConflictException('Username is already taken');
    }
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersRepository.save({
      username: createUserDto.username,
      passwordHash: passwordHash,
      role: createUserDto.role,
    });
    return this.toPublic(user);
  }

  async findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username: username },
    });
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map((user) => this.toPublic(user));
  }

  private async findEntity(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async findOne(id: number) {
    const user = await this.findEntity(id);
    return this.toPublic(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findEntity(id);
    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.username !== undefined) {
      const existing = await this.findByUsername(updateUserDto.username);
      if (existing && existing.id !== id) {
        throw new ConflictException('Username is already taken');
      }
      user.username = updateUserDto.username;
    }
    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role;
    }
    const saved = await this.usersRepository.save(user);
    return this.toPublic(saved);
  }

  async remove(id: number) {
    const user = await this.findEntity(id);
    await this.usersRepository.remove(user);
  }

  private toPublic(user: User) {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
