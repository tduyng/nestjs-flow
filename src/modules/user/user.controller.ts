import { IRequestWithUser } from '@common/interfaces/http.interface';
import { CreateAddressDto, UpdateAddressDto } from '@modules/address/dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public async getUsers() {
    return await this.userService.getUsers();
  }

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
}
