import { IsIn } from 'class-validator';

export class UpdateUserPreferenceDto {
  @IsIn(['hu-HU', 'en-US'])
  language: string;
}
