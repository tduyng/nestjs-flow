import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetCommentsDto {
  @Type(() => String)
  @IsOptional()
  postId?: string;
}
