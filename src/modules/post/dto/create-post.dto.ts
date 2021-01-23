import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString({ each: true })
  @IsNotEmpty()
  @IsOptional()
  paragraphs?: string[];

  @IsString()
  content: string;
}
