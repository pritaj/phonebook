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

  await app.close();
}
seed();
