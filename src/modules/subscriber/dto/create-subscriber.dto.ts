import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateSubscriberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name: string;
}
