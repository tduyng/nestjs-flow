## 9.2  Private bucket AWS


Check the code at branch [9-aws-s3](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/9-aws-s3)

There is quite a bit more to Amazon S3 than storing public files. In this article, we look into how we can manage private files. To do so, we learn how to set up a proper private Amazon S3 bucket and how to upload and access files. We use streams and generate presigned URLs with an expiration time.

### Setting up AWS S3

We will create new bucket as we did in the previous part. But this time, we will make private bucket. That's means we will block all public access for bucket (feature of AWS S3)

The first thing to do is to create a new bucket.

<div align="center">
<img src="../docs/images/9-s3-private-bucket.png" alt="private-bucket">
</div>


This time, we intend to restrict access to the files we upload. Every time we want our users to be able to access a file, they will need to do it through our API.

<div align="center">
<img src="../docs/images/9-s3-private-bucket-2.png" alt="private-bucket">
</div>

The IAM user that we’ve created in the previous part of this series has access to all our buckets. Therefore, all we need to do to start using it is to add the name of the bucket to our environment variables.

- Update `.env` file
  ```env
  # ...
  AWS_PRIVATE_BUCKET_NAME=nestjs-series-private-bucket
  ```
- Update `node.d.ts`
  ```ts
  // node.d.ts
  declare namespace NodeJS {
    interface ProcessEnv {
     // ...
      readonly AWS_PRIVATE_BUCKET_NAME: string;
    }
  }
  ```

### Update FileModule for Private bucket

- Create privateFiles entity: `src/modules/files/private-file.entity.ts`
  ```ts
  // private-file.entity.ts

  import { User } from '@modules/user/user.entity';
  import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

  @Entity()
  export class PrivateFile {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ unique: true })
    public key: string;

    @ManyToOne(() => User, (owner: User) => owner.files)
    public owner: User;
  }

  ```
- Using **PrivateFile** in **UserEntity**
  ```ts
  // user.entity.ts
  // ...
  import { PublicFile } from '@modules/files/public-file.entity';
  import { PrivateFile } from '@modules/files/private-file.entity';

  @Entity()
  export class User {
    // ...

    @OneToMany(
      () => PrivateFile,
      (file: PrivateFile) => file.owner
    )
    public files: PrivateFile[];
  }
  ```
- Create **PrivateFileService**: `src/modules/files/services/private-files.service.ts`
  ```ts
  // private.files.service.ts

  import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { CreatePrivateFileDto } from '../dto/create-private-file.dto';
  import { PrivateFileRepository } from '../repositories/private-file.repository';
  import { S3Service } from './s3.service';

  @Injectable()
  export class PrivateFileService {
    constructor(
      @InjectRepository(PrivateFileRepository)
      private privateFileRepo: PrivateFileRepository,
      private s3Service: S3Service,
    ) {}
    //...

   public async uploadPrivateFile(
      ownerId: string,
      dataBuffer: Buffer,
      filename: string,
    ) {
      try {
        const uploadResult = await this.s3PrivateFileService.uploadResult(
          dataBuffer,
          filename,
        );
        const fileDto: CreatePrivateFileDto = {
          key: uploadResult.Key,
          owner: {
            id: ownerId,
          },
        };
        const newFile = await this.privateFileRepo.createPrivateFile(fileDto);
        return newFile;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    public async uploadMultiplePrivateFile(
      ownerId: string,
      uploadFiles: UploadFileDto[],
    ) {
      try {
        const resultFiles = [];
        for (const upload of uploadFiles) {
          const uploadResult = await this.s3PrivateFileService.uploadResult(
            upload.dataBuffer,
            upload.filename,
          );
          const fileDto: CreatePrivateFileDto = {
            key: uploadResult.Key,
            owner: {
              id: ownerId,
            },
          };
          const newFile = await this.privateFileRepo.createPrivateFile(fileDto);
          resultFiles.push(newFile);
        }

        return resultFiles;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    public async deletePrivateFile(fileId: string) {
      const file = await this.getFileById(fileId);
      try {
        const fileDto: DeletePrivateFileDto = {
          key: file.key,
        };
        await this.s3PrivateFileService.deleteFile(fileDto);

        return await this.privateFileRepo.deleteFile(fileId);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  ```
- Update **UserService**
  ```ts
  // user.service.ts
  // ...
  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(UserRepository)
      private readonly userRepository: UserRepository,
      private readonly publicFileService: PublicFileService,
      private readonly addressService: AddressService,
      private readonly privateFileService: PrivateFileService,
    ) {}

    //...
    public async addPrivateFile(
      userId: string,
      dataBuffer: Buffer,
      filename: string,
    ) {
      return await this.privateFileService.uploadPrivateFile(
        userId,
        dataBuffer,
        filename,
      );
    }

    public async addMultiplePrivateFile(
      userId: string,
      uploadFiles: UploadFileDto[],
    ) {
      return await this.privateFileService.uploadMultiplePrivateFile(
        userId,
        uploadFiles,
      );
    }
    public async deletePrivateFile(userId: string, fileId: string) {
      try {
        const canRemoveFile = await this.userRepository.canRemoveFile(
          userId,
          fileId,
        );
        if (canRemoveFile) {
          await this.privateFileService.deletePrivateFile(fileId);
          return { deleted: true };
        }
        return { deleted: false };
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  ```
- Update **UserController**

  ```ts
  // user.controller.ts
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
  ```
- Test with Postman
  After doing all of the above, our users can start uploading private files.

  <div align="center">
  <img src="../docs/images/9-s3-test-upload-private-files.png" alt="upload private file">
  </div>

  You can also implement deleting the files in a very similar way as in the previous part.

- Accessing private files
  Since the files we upload above are private, we can’t access them by simply entering a URL. Trying to do so will result in getting an error.

  <div align="center">
  <img src="../docs/images/9-s3-error-accessing-files.png" alt="error access file">
  </div>

  There is more than one way to approach this issue. Let’s start with the most straightforward one.

### Fetch files and Generating presigned URLs from AWS S3 as  a stream

The first solution to the above issue is to send the file through our API. The most fitting way to do that is to pipe a readable stream that we can get from the AWS SDK to our response. We will work directly with streams and don't need to download the file into the memory server.


The first thing to do is to get a readable stream of data from our Amazon S3 bucket.
- Update **S3PrivateFileService**: `src/modules/files/services/s3-private-file.service.ts`
  ```ts
  //...
   public async createStreamFromFile(fileKey: string) {
    return await this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: fileKey,
      })
      .createReadStream();
  }

  public async generatePresignedUrl(fileKey: string) {
    const url = await this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: fileKey,
    });
    return url;
  }
  ```


- Update **PrivateFileService**: `src/modules/files/services/private-file.service.ts`
  ```ts
  // private-file.service.ts
  // ...
  public async getPrivateFileFromAWS(fileId: string) {
    const file = await this.getFileById(fileId);
    try {
      const stream = await this.s3PrivateFileService.createStreamFromFile(
        file.key,
      );
      return {
        stream,
        info: file,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async generatePresignedUrl(fileKey: string) {
    try {
      return await this.s3PrivateFileService.generatePresignedUrl(fileKey);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  ```

Now we need to make sure if the users should be able to download the file.
- Update **UserService**: `src/modules/user/user.service.ts`
  ```ts
  // user.service.ts
   public async getPrivateFileFromAWS(userId: string, fileId: string) {
    try {
      const file = await this.privateFileService.getPrivateFileFromAWS(fileId);
      if (file.info.owner.id === userId) {
        return file;
      }
      throw new UnauthorizedException();
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  public async getAllPrivatesFileFromAWS(userId: string) {
    try {
      const userWithFiles = await this.userRepository.getUserWithFilesById(
        userId,
      );
      if (!userWithFiles) {
        throw new NotFoundException('User not found');
      }
      return Promise.all(
        userWithFiles.files.map(async (file) => {
          const url = await this.privateFileService.generatePresignedUrl(
            file.key,
          );
          return {
            ...file,
            url,
          };
        }),
      );
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  ```
- Update **UserController**
  ```ts
  // user.service.ts
  // ...
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
  ```

Now, the user can access all of the files in a very straightforward way.

<div align="center">
<img src="../docs/images/9-s3-test-get-generating-url.png" alt="test url aws">
</div>
