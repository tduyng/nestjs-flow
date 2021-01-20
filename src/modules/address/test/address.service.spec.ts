import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddressRepository } from '../address.repository';
import { AddressService } from '../address.service';
import { CreateAddressDto } from '../dto';
import { Address } from '@modules/address/address.entity';

const oneAddress = {
  id: 'some id',
  number: 'some number',
  street: 'some street',
  city: 'some city',
  country: 'some country',
} as Address;
const addressDto: CreateAddressDto = {
  number: 'some number',
  street: 'some street',
  city: 'some city',
  country: 'some country',
};

describe('AddressService', () => {
  let addressService: AddressService;
  let addressRepository;

  const mockAddressRepository = () => ({
    getAddressById: jest.fn(),
    createAddressAndSave: jest.fn(),
    createAddress: jest.fn(),
    createAddressWithoutSave: jest.fn(),
    updateAddress: jest.fn(),
    updateAddressDirect: jest.fn(),
    deleteAddress: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: AddressRepository,
          useFactory: mockAddressRepository,
        },
      ],
    }).compile();
    addressRepository = module.get<AddressRepository>(AddressRepository);
    addressService = module.get<AddressService>(AddressService);
  });

  it('Should be defined', () => {
    expect(addressService).toBeDefined();
  });

  describe('getAddressById', () => {
    it('Should throw an error if not found', async () => {
      addressRepository.getAddressById.mockReturnValue(null);
      try {
        await addressService.getAddressById('some id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('Should return an address', async () => {
      addressRepository.getAddressById.mockReturnValue(oneAddress);
      const result = await addressService.getAddressById('some id');
      expect(result).toEqual(oneAddress);
    });
  });

  describe('createAddress', () => {
    it('Should create new address', async () => {
      addressRepository.createAddress.mockReturnValue(oneAddress);
      const result = addressService.createAddress(addressDto);
      expect(result).resolves.toEqual(oneAddress);
    });
  });
  describe('createAddressAndSave', () => {
    it('Should create new address', async () => {
      addressRepository.createAddressAndSave.mockReturnValue(oneAddress);
      const result = await addressService.createAddress(addressDto);
      expect(result).toEqual(oneAddress);
    });
  });
  describe('createAddressWithoutSave', () => {
    it('Should create new address', async () => {
      addressRepository.createAddressWithoutSave.mockReturnValue(oneAddress);
      const result = addressService.createAddress(addressDto);
      expect(addressRepository.save).not.toBeCalled();
      expect(result).resolves.toEqual(oneAddress);
    });
  });

  describe('updateAddress', () => {
    it('Should return an error', async () => {
      addressRepository.getAddressById.mockReturnValue(null);
      try {
        await addressService.updateAddress('some id', addressDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  it('Should update successfully address', async () => {
    addressRepository.getAddressById.mockReturnValue(oneAddress);
    addressRepository.updateAddress.mockReturnValue(oneAddress);
    const result = await addressService.updateAddress('some id', addressDto);
    expect(result).toEqual(oneAddress);
  });

  describe('updateAddressDirect', () => {
    it('Should update successfully address', async () => {
      addressRepository.updateAddressDirect.mockReturnValue(oneAddress);
      const result = await addressService.updateAddressDirect(
        oneAddress,
        addressDto,
      );
      expect(result).toEqual(oneAddress);
    });
  });

  describe('deleteAddress', () => {
    it('Should delete successfully address', async () => {
      addressRepository.deleteAddress.mockReturnValue({ deleted: true });
      const result = await addressService.deleteAddress('some id');
      expect(result).toEqual({ deleted: true });
    });
  });
});
