import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { AuditService } from '../audit/audit.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const employeesService = {
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const auditService = { log: jest.fn() };
  const req = { user: { username: 'admin' } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: employeesService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('létrehozáskor naplózza a műveletet', async () => {
    employeesService.create.mockResolvedValue({
      id: 5,
      lastName: 'Teszt',
      firstName: 'Elek',
    });

    const result = await controller.create(
      { lastName: 'Teszt', firstName: 'Elek', departmentId: 1 },
      req,
    );

    expect(result.id).toBe(5);
    expect(auditService.log).toHaveBeenCalledWith(
      'admin',
      'CREATE',
      'Employee',
      5,
      'Teszt Elek',
    );
  });

  it('törléskor naplózza a műveletet', async () => {
    employeesService.findOne.mockResolvedValue({
      id: 7,
      lastName: 'Teszt',
      firstName: 'Elek',
    });
    employeesService.remove.mockResolvedValue(undefined);

    await controller.remove(7, req);

    expect(employeesService.remove).toHaveBeenCalledWith(7);
    expect(auditService.log).toHaveBeenCalledWith(
      'admin',
      'DELETE',
      'Employee',
      7,
      'Teszt Elek',
    );
  });
});
