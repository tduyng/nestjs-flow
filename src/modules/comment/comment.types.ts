import { IsString } from 'class-validator';

export class ObjectWithIdDTO {
  @IsString()
  id: string;
}
