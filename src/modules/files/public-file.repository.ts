import { EntityRepository, Repository } from 'typeorm';
import { CreatePublicFileDto } from './dto';
import { PublicFile } from './public-file.entity';

@EntityRepository(PublicFile)
export class PublicFileRepository extends Repository<PublicFile> {
  public async createPublicFile(fileDto: CreatePublicFileDto) {
    const newFile = this.create(fileDto);
    await this.save(fileDto);
    return newFile;
  }
  public async getFileById(id: string) {
    return await this.findOne({ where: { id: id } });
  }

  public async deleteFile(id: string) {
    await this.delete(id);
    return {
      deleted: true,
    };
  }
}
