import { IsString } from 'class-validator';
export class UpdateAvatarDto {
  @IsString()
  avatar: any;
}
