import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  name: string;
}
