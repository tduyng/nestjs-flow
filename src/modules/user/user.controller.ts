import { IRequestWithUser } from '@common/global-interfaces/http.interface';
import { CreateAddressDto, UpdateAddressDto } from '@modules/address/dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UploadFileDto } from '@modules/files/dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { PaginationDto } from '@common/global-dto/pagination.dto';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public async getUsers(@Query() paginationDto?: PaginationDto) {
    return await this.userService.getUsers(paginationDto);
  }

  /* Avatar */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async addAvatar(@Req() req: IRequestWithUser, @UploadedFile() file) {
    const { user } = req;
    return await this.userService.addAvatar(
      user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  public async deleteAvatar(@Req() req: IRequestWithUser) {
    return await this.userService.deleteAvatar(req.user.id);
  }

  /* Test connection between user & public files */
  @Post('avatar/test/:fileId')
  @UseGuards(JwtAuthGuard)
  public async testUpdateUserAvatar(
    @Req() req: IRequestWithUser,
    @Param('fileId') fileId: string,
  ) {
    const { user } = req;
    return await this.userService.testUpdateUserAvatar(user, fileId);
  }

  /* Address */
  @Post('address')
  @UseGuards(JwtAuthGuard)
  public async addAddress(
    @Req() req: IRequestWithUser,
    @Body() addressDto: CreateAddressDto,
  ) {
    const { user } = req;
    return await this.userService.createUserAddress(user.id, addressDto);
  }

  @Put('address')
  @UseGuards(JwtAuthGuard)
  public async updateAddress(
    @Req() req: IRequestWithUser,
    @Body() addressDto: UpdateAddressDto,
  ) {
    const { user } = req;
    return await this.userService.updateUserAddress(user.id, addressDto);
  }
  @Delete('address')
  @UseGuards(JwtAuthGuard)
  public async deleteAddress(@Req() req: IRequestWithUser) {
    const { user } = req;
    return await this.userService.deleteUserAddress(user.id);
  }

  /* Private files */
  @Get('files/:fileId')
  @UseGuards(JwtAuthGuard)
  public async getUserPrivateFileFromAWS(
    @Req() req: IRequestWithUser,
    @Param('fileId') fileId: string,
  ) {
    const file = await this.userService.getPrivateFileFromAWS(
      req.user.id,
      fileId,
    );
    file.stream.pipe(req.res);
  }

  @Get('files')
  @UseGuards(JwtAuthGuard)
  public async getAllUserFilesFromAWS(@Req() req: IRequestWithUser) {
    return await this.userService.getAllPrivatesFileFromAWS(req.user.id);
  }

  @Post('files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async addFile(@Req() req: IRequestWithUser, @UploadedFile() file) {
    const { user } = req;
    return await this.userService.addPrivateFile(
      user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Post('files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  public async addMultipleFiles(
    @Req() req: IRequestWithUser,
    @UploadedFiles() files,
  ) {
    const { user } = req;
    const uploadFiles = [] as UploadFileDto[];
    files.forEach((file) => {
      uploadFiles.push({
        dataBuffer: file.buffer,
        filename: file.originalname,
      });
    });
    return await this.userService.addMultiplePrivateFile(user.id, uploadFiles);
  }

  @Delete('files/:fileId')
  @UseGuards(JwtAuthGuard)
  public async deleteFile(
    @Req() req: IRequestWithUser,
    @Param('fileId') fileId: string,
  ) {
    return await this.userService.deletePrivateFile(req.user.id, fileId);
  }

  /* Test upload files directly, not pass AWS S3 */
  @Post('files/test')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'src/common/upload',
      }),
    }),
  )
  public async testUploadFileWithoutAWS(
    @Req() req: IRequestWithUser,
    @UploadedFile() file,
  ) {
    const { user } = req;
    return await this.userService.testAddFileWithoutAWS(
      user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Post('files/test/multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: 'src/common/upload',
      }),
    }),
  )
  public async testUploadMultipleFilesWithoutAWS(
    @Req() req: IRequestWithUser,
    @UploadedFiles() files,
  ) {
    const { user } = req;
    const uploadFiles = [] as UploadFileDto[];
    files.forEach((file) => {
      uploadFiles.push({
        dataBuffer: file.buffer,
        filename: file.originalname,
      });
    });
    return await this.userService.testAddMultipleFilesWithoutAWS(
      user.id,
      uploadFiles,
    );
  }

  @Delete('files/test/:fileId')
  @UseGuards(JwtAuthGuard)
  public async testDeleteFileWithoutAWS(
    @Req() req: IRequestWithUser,
    @Param('fileId') fileId: string,
  ) {
    return await this.userService.testDeletePrivateFileWithoutAWS(
      req.user.id,
      fileId,
    );
  }
}
