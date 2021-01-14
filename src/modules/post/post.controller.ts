import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  public async getPost() {
    return await this.postService.getPosts();
  }

  @Get('/:id')
  public async getPostId(@Param('id') id: string) {
    return await this.postService.getPostById(id);
  }

  @Post('/')
  public async createPost(@Body() postDto: CreatePostDto) {
    return await this.postService.createPost(postDto);
  }

  @Put('/:id')
  public async updatePost(
    @Param('id') id: string,
    @Body() postDto: UpdatePostDto,
  ) {
    return await this.postService.updatePost(id, postDto);
  }

  @Delete('/:id')
  public async deletePost(@Param('id') id: string) {
    return await this.postService.deletePost(id);
  }
}
