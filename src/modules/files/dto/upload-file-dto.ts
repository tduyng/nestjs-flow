import { IsString } from 'class-validator';

export class UploadFileDto {
  dataBuffer: Buffer;

  @IsString()
  filename: string;
}
