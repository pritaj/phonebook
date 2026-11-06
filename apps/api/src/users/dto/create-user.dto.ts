import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  @IsString()
  role?: string;
}
