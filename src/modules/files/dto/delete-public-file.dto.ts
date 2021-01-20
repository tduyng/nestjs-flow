import { IsString } from 'class-validator';

export class DeletePublicFileDto {
  @IsString()
  key: string;
}
