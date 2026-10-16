import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartmentsService } from './departments/departments.service';
import { DataSource } from 'typeorm';
import { EmployeesService } from './employees/employees.service';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const departmentsService = app.get(DepartmentsService);
  const employeesService = app.get(EmployeesService);
  const usersService = app.get(UsersService);
  const dataSource = app.get(DataSource);

  await dataSource.query('TRUNCATE TABLE department RESTART IDENTITY CASCADE');
  await dataSource.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');

  const createDept = await departmentsService.create({
    nameHu: 'Példa Kft.',
    nameEn: 'Example Ltd.',
  });
  const createChildDataProd = await departmentsService.create({
    nameHu: 'Termelés/Production',
    nameEn: 'Production',
    parentId: createDept.id,
  });
  const createAlChildDataMaint = await departmentsService.create({
    nameHu: 'Karbantartás/Maintenance',
    nameEn: 'Maintenance',
    parentId: createChildDataProd.id,
  });
  const createAlChildDataQuality = await departmentsService.create({
    nameHu: 'Minőségbiztosítás/Quality Assurance',
    nameEn: 'Quality Assurance',
    parentId: createChildDataProd.id,
  });

  const createChildDataHR = await departmentsService.create({
    nameHu: 'Emberi erőforrás/Human Resources',
    nameEn: 'Human Resources',
    parentId: createDept.id,
  });
  const createChildDataIT = await departmentsService.create({
    nameHu: 'Informatika/IT',
    nameEn: 'IT',
    parentId: createDept.id,
  });
  const createChildDataFi = await departmentsService.create({
    nameHu: 'Pénzügy/Finance',
    nameEn: 'Finance',
    parentId: createDept.id,
  });

  //employees
  await employeesService.create({
    lastName: 'Nagy',
    firstName: 'Péter',
    departmentId: createChildDataIT.id,
    email: 'nagy.peter@example.com',
    position: 'Rendszergazda',
    inside: true,
  });

  await employeesService.create({
    lastName: 'Kovács',
    firstName: 'András',
    departmentId: createAlChildDataMaint.id,
    phone: '+36300000000',
    email: 'kovacs.andras@example.com',
    position: 'Karbantartó technikus',
    inside: true,
  });

  await employeesService.create({
    lastName: 'Farkas',
    firstName: 'Réka',
    departmentId: createChildDataProd.id,
    phone: '+36300000001',
    email: 'farkas.reka@example.com',
    position: 'Termelésvezető',
  });

  await employeesService.create({
    lastName: 'Halász',
    firstName: 'Ferenc',
    departmentId: createAlChildDataQuality.id,
    phone: '+36300000002',
    email: 'halasz.ferenc@example.com',
    position: 'Minőségbiztosítási mérnök',
    inside: true,
  });

  await employeesService.create({
    lastName: 'Pápai',
    firstName: 'Csilla',
    departmentId: createChildDataHR.id,
    phone: '+36300000003',
    email: 'papai.csilla@example.com',
    position: 'HR asszisztens',
    inside: true,
  });

  await employeesService.create({
    lastName: 'Kálmán',
    firstName: 'István',
    departmentId: createChildDataFi.id,
    phone: '+36300000004',
    email: 'kalman.istvan@example.com',
    position: 'Pénzügyi elemző',
  });

  await usersService.create({
    username: "testuser",
    password: '1234',
    role: 'user',
  });

  await app.close();
}
seed();
