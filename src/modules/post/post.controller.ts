import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostService } from './post.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Posts')
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

  @UseGuards(JwtAuthGuard)
  @Post('/')
  public async createPost(@Body() postDto: CreatePostDto) {
    return await this.postService.createPost(postDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  public async updatePost(
    @Param('id') id: string,
    @Body() postDto: UpdatePostDto,
  ) {
    return await this.postService.updatePost(id, postDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  public async deletePost(@Param('id') id: string) {
    return await this.postService.deletePost(id);
  }
}
