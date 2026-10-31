import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';

describe('CreateEmployeeDto', () => {
  it('érvényes adatokkal nincs hiba', async () => {
    const dto = plainToInstance(CreateEmployeeDto, {
      lastName: 'Kovács',
      firstName: 'Roland',
      departmentId: 1,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('hiányzó vezetéknévre hibát ad', async () => {
    const dto = plainToInstance(CreateEmployeeDto, {
      firstName: 'Roland',
      departmentId: 1,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('lastName');
  });

  it('szöveges osztályazonosítóra hibát ad', async () => {
    const dto = plainToInstance(CreateEmployeeDto, {
      lastName: 'Kovács',
      firstName: 'Roland',
      departmentId: 'egy',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('departmentId');
  });

  it('érvénytelen e-mail-címre hibát ad', async () => {
    const dto = plainToInstance(CreateEmployeeDto, {
      lastName: 'Kovács',
      firstName: 'Roland',
      departmentId: 1,
      email: 'nem-email',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });
});
