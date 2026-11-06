import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  nameHu: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
