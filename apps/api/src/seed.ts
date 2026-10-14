import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartmentsService } from './departments/departments.service';
import { DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const departmentsService = app.get(DepartmentsService);
  const dataSource = app.get(DataSource);
  const deleteData = await dataSource.query(
    'TRUNCATE TABLE department RESTART IDENTITY CASCADE',
  );
  const createDept = await departmentsService.create({
    nameHu: 'Példa Kft.',
    nameEn: 'Example Ltd.',
  });
  const createChildData = await departmentsService.create({
    nameHu: 'Termelés/Production',
    nameEn: 'Production',
    parentId: createDept.id,
  });
  const createAlChildData = await departmentsService.create({
    nameHu: 'Karbantartás/Maintenance',
    nameEn: 'Maintenance',
    parentId: createChildData.id,
  });
  const createAlChildDataQuality = await departmentsService.create({
    nameHu: 'Minőségbiztosítás/Quality Assurance',
    nameEn: 'Quality Assurance',
    parentId: createChildData.id,
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

  await app.close();
}
seed();
