import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { DeletePublicFileDto } from '../dto';

@Injectable()
export class S3PrivateFileService {
  private s3: S3;
  private bucketName: string;
  constructor() {
    this.s3 = new S3();
    this.bucketName = process.env.AWS_PRIVATE_BUCKET_NAME;
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
        Bucket: this.bucketName,
        Key: fileDto.key,
      })
      .promise();
    return { deleted: true };
  }
}
