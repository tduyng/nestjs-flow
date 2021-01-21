import { IsString } from 'class-validator';

export class DeletePrivateFileDto {
  @IsString()
  key: string;
}
