import { IsEmail, IsString, Min } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Min(3)
  password: string;
}
