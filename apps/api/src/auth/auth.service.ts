import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Hibás felhasználónev vagy jelszó',
      });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        message: 'Hibás felhasználónev vagy jelszó',
      });
    }
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
