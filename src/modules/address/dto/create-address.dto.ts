import { IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  number: string;

  @IsString()
  street: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
}
