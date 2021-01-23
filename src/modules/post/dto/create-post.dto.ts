import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString({ each: true })
  @IsNotEmpty()
  paragraphs: string[];

  @IsString()
  content: string;
}
