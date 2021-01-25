import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  Query,
  CacheKey,
  CacheTTL,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostService } from './services/post.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GET_POSTS_CACHE_KEY } from './types/post.types';
import { HttpCacheInterceptor } from './utils/http-cache.interceptor';

@ApiTags('Posts')
@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_POSTS_CACHE_KEY)
  @CacheTTL(120)
  @Get()
  public async getPosts(@Query('search') search?: string) {
    if (search) {
      return this.postService.searchForPost(search);
    }
    return await this.postService.getPosts();
  }

  @Get('/:id')
  public async getPostById(@Param('id') id: string) {
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
