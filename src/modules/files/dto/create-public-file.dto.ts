import { IsString } from 'class-validator';

export class CreatePublicFileDto {
  @IsString()
  key: string;

  @IsString()
  url: string;
}
