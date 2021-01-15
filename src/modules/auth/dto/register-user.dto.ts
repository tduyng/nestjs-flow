import { IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
