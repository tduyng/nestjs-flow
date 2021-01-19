import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { AddressRepository } from './address.repository';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: AddressRepository,
  ) {}

  public async getAddressById(id: string) {
    try {
      const address = await this.addressRepo.getAddressById(id);
      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return address;
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

  public async createAddress(addressDto: CreateAddressDto) {
    try {
      return await this.addressRepo.createAddress(addressDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async createAddressAndSave(addressDto: CreateAddressDto) {
    try {
      return await this.addressRepo.createAddressAndSave(addressDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async createAddressWithoutSave(addressDto: CreateAddressDto) {
    try {
      return await this.addressRepo.createAddressWithoutSave(addressDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updateAddress(id: string, addressDto: UpdateAddressDto) {
    try {
      const address = await this.getAddressById(id);
      return await this.addressRepo.updateAddress(address, addressDto);
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
  public async updateAddressDirect(
    address: Address,
    addressDto: UpdateAddressDto,
  ) {
    try {
      return await this.addressRepo.updateAddress(address, addressDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteAddress(id: string) {
    try {
      return this.addressRepo.deleteAddress(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
