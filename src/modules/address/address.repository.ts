import { EntityRepository, Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {
  public async getAddressById(id: string): Promise<Address> {
    return await this.findOne({ where: { id: id } });
  }

  public async createAddress(addressDto: CreateAddressDto): Promise<Address> {
    const address = this.create(addressDto);
    await this.save(address);
    return address;
  }
  public async updateAddress(
    address: Address,
    addressDto: UpdateAddressDto,
  ): Promise<Address> {
    const updated = Object.assign(address, addressDto);
    await this.save(updated);
    return updated;
  }

  public async deleteAddress(id: string) {
    await this.delete(id);
    return { deleted: true };
  }
}
