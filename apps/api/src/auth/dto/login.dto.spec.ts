import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('nem ad hibát, ha a felhasználónév és a jelszó is meg van adva', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'testuser',
      password: '1234',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('hibát ad, ha a felhasználónév üres', async () => {
    const dto = plainToInstance(LoginDto, {
      username: '',
      password: '1234',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
  });
  it('hibát ad, ha a jelszó hiányzik', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'testuser',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });
});
