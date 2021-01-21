import { IsString } from 'class-validator';

export class CreatePrivateFileDto {
  @IsString()
  key: string;

  owner: {
    id: string;
  };
}
