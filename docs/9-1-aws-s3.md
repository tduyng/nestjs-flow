# 9  Web service AWS S3

## 9.1  Public bucket

Check the code at branch [9-aws-s3](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/9-aws-s3)


**Amazon S3** has a simple web services interface that you can use to store and retrieve any amount of data, at any time, from anywhere on the web. It gives any developer access to the same highly scalable, reliable, fast, inexpensive data storage infrastructure that Amazon uses to run its own global network of web sites. The service aims to maximize benefits of scale and to pass those benefits on to developers.
### Create IAM user
To use AWS service S3, make sure you have an [account AWS](https://aws.amazon.com/account/).

Each service of AWS need an [Identity and Access Management (IAM)](https://console.aws.amazon.com/iam/home#/users)

After create an user IAM for S3 service, you will receive an **Access key ID** and an **Secret access key**. We will add them in `.env` file to connect to AWS service through our API.

We also need to choose one of [the available regions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html). For example, my  regions is: **eu-west-3** for Europe France

<div align="center">
<img src="../docs/images/9-iam.png" alt="Add user iam">
<span> </span>
<img src="../docs/images/9-iam-2.png" alt="Add user iam">

</div>

### Create AWS S3 bucket

In Amazon S3 data is organized in buckets. We can have multiple buckets with different settings.

Let’s open the [Amazon S3 panel](https://console.aws.amazon.com/s3/home?region=us-east-1) and create a bucket. Please note that the name of the bucket must be unique.

<div align=center>
<img src="../docs/images/9-s3-bucket.png" alt="s3 bucket">
</div>

We can set up our bucket to contain public files. All files that we upload to this bucket will be publicly available. We might use it to manage files such as avatars.
<div align=center>
<img src="../docs/images/9-s3-bucket-2.png" alt="s3 bucket">
</div>

### Update variables environments
Now start to setup connection for AWS in our API
- `.env` file
  ```env
  # ...
  AWS_REGION=eu-west-3
  AWS_ACCESS_KEY_ID=*******
  AWS_SECRET_ACCESS_KEY=*******
  AWS_PUBLIC_BUCKET_NAME=nestjs-flow-public-bucket
  ```

- Update types in `src/common/types/node.d.ts`
  ```ts
  // node.d.ts
    declare namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly SERVER_PORT: string;
      readonly TYPEORM_CONNECTION: string;
      readonly TYPEORM_HOST: string;
      readonly TYPEORM_USERNAME: string;
      readonly TYPEORM_PASSWORD: string;
      readonly TYPEORM_DATABASE: string;
      readonly TYPEORM_PORT: string;
      readonly TYPEORM_LOGGING: string;
      readonly TYPEORM_ENTITIES: string;
      readonly TYPEORM_MIGRATIONS: string;
      readonly ROUTE_GLOBAL_PREFIX: string;
      readonly JWT_SECRET: string;
      readonly TWO_FACTOR_AUTHENTICATION_APP_NAME: string;
      readonly JWT_EXPIRATION_TIME: string;
      readonly AWS_REGION: string;
      readonly AWS_ACCESS_KEY_ID: string;
      readonly AWS_SECRET_ACCESS_KEY: string;
      readonly AWS_PUBLIC_BUCKET_NAME: string;
    }
  }

  ```

- To connect with AWS service, we need to install [aws-sdk-js](https://github.com/aws/aws-sdk-js)
  ```bash
  $ yarn add aws-sdk
  $ yarn add -D @types/aws-sdk
  ```
### Create FileModule
We will use AWS S3 to upload avatar of user.

- Create `src/modules/files/public-file.entity.ts`

  ```ts
  // public-file.entity.ts
  import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

  @Entity()
  export class PublicFile {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ unique: true })
    public key: string;

    @Column()
    public url: string;
  }
  ```
- Create `src/modules/files/services/s3.service.ts`
  ```ts
  // s3.service.ts
  import { Injectable } from '@nestjs/common';
  import { S3 } from 'aws-sdk';
  import { v4 as uuid } from 'uuid';
  import { DeletePublicFileDto } from '../dto';

  @Injectable()
  export class S3Service {
    private s3: S3;
    private bucketName: string;
    constructor() {
      this.s3 = new S3();
      this.bucketName = process.env.AWS_PUBLIC_BUCKET_NAME;
    }
    public async uploadResult(
      dataBuffer: Buffer,
      filename: string,
    ): Promise<S3.ManagedUpload.SendData> {
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Body: dataBuffer,
          Key: `${uuid()}-${filename}`,
        })
        .promise();
      return uploadResult;
    }

    public async deleteFile(fileDto: DeletePublicFileDto) {
      await this.s3
        .deleteObject({
          Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
          Key: fileDto.key,
        })
        .promise();
      return { deleted: true };
    }
  }

  ```
  Why we need an file dependent for s3Service? --> We use the dependents service for easier in test.
- Create `src/modules/files/services/files.service.ts`
  ```ts
  // files.service.ts
  import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { PublicFileRepository } from '../public-file.repository';

  import { CreatePublicFileDto, DeletePublicFileDto } from '../dto';
  import { S3Service } from './s3.service';
  import { PublicFile } from '../public-file.entity';

  @Injectable()
  export class FilesService {
    constructor(
      @InjectRepository(PublicFileRepository)
      private readonly publicFileRepo: PublicFileRepository,
      private readonly s3Service: S3Service,
    ) {}

    public async getFileById(id: string) {
      try {
        const file = this.publicFileRepo.getFileById(id);
        if (!file) {
          throw new NotFoundException('File not found');
        }
        return file;
      } catch (error) {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw error;
        }
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
    }

    public async uploadPublicFile(dataBuffer: Buffer, filename: string) {
      try {
        const uploadResult = await this.s3Service.uploadResult(
          dataBuffer,
          filename,
        );
        const fileDto: CreatePublicFileDto = {
          key: uploadResult.Key,
          url: uploadResult.Location,
        };
        const newFile = await this.publicFileRepo.createPublicFile(fileDto);
        return newFile;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    public async deletePublicFile(fileId: string) {
      try {
        const file = await this.publicFileRepo.getFileById(fileId);
        if (!file) {
          throw new NotFoundException('File not found');
        }
        const fileDto: DeletePublicFileDto = {
          key: file.key,
        };
        await this.s3Service.deleteFile(fileDto);

        return await this.publicFileRepo.deleteFile(fileId);
      } catch (error) {
        if (error.status === HttpStatus.NOT_FOUND) {
          throw error;
        } else {
          throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }
  }

  ```
And we package all these file to **FileModule**

- Using **PublicFile Entity** and **FileService** in UserModule to create **user avatar**.

  User Entity:
  ```ts
  // user.entity.ts
  // ....
  @JoinColumn()
  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  public avatar: PublicFile;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
  // ...
  ```

- Create methods upload and delete avatar

  In `user.service.ts`: create method: **addAvatar** & **deleteAvatar**

  ```ts
  // user.service.ts

   public async addAvatar(
      userId: string,
      imageBuffer: Buffer,
      filename: string,
    ) {
      try {
        const user = await this.userRepository.getUserById(userId);
        if (user.avatar) {
          await this.userRepository.updateAvatar(user, {
            avatar: null,
          });
          await this.filesService.deletePublicFile(user.avatar.id);
        }
        const avatar = await this.filesService.uploadPublicFile(
          imageBuffer,
          filename,
        );
        await this.userRepository.updateAvatar(user, { avatar: avatar });
        return avatar;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    public async deleteAvatar(userId: string) {
      try {
        const user = await this.userRepository.getUserById(userId);
        const fileId = user.avatar?.id;
        if (fileId) {
          await this.userRepository.updateAvatar(user, {
            avatar: null,
          });
          await this.filesService.deletePublicFile(fileId);
        }
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  ```

  Then create 2 routes for 2 this methods in **UserController**

  ```ts
  // user.controller.ts
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
  ```
</details>

When all things done, you can start to test upload image to AWS through your API with Postman

<div align="center">
<img src="../docs/images/9-s3-test-upload-image.png" alt="upload image">
</div>

That's is all the setup to use Public bucket service of AWS.
