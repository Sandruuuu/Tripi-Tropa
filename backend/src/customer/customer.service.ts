import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCustomerDto,
  CustomerFilterDto,
  UpdateCustomerDto,
} from './dto/customer.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { hashPassword } from '../common/utils/password.util';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async register(dto: CreateCustomerDto) {
    const exists = await this.prisma.customer.findFirst({
      where: {
        OR: [{ username: dto.username }, { customer_number: dto.customer_number }],
      },
    });
    if (exists) {
      throw new ConflictException('Username atau NIK sudah digunakan');
    }

    const customer = await this.prisma.customer.create({
      data: {
        ...dto,
        password: await hashPassword(dto.password),
      },
      select: this.publicFields(),
    });

    return { message: 'Registrasi customer berhasil', data: customer };
  }

  async findMe(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: this.publicFields(),
    });
    if (!customer) {
      throw new NotFoundException('Customer tidak ditemukan');
    }
    return { message: 'Profil customer berhasil diambil', data: customer };
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = buildSearchFilter(query.search, [
      'username',
      'name',
      'phone',
      'customer_number',
    ]);

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        select: this.publicFields(),
        orderBy: { id: 'asc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      message: 'Daftar customer berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: this.publicFields(),
    });
    if (!customer) {
      throw new NotFoundException('Customer tidak ditemukan');
    }
    return { message: 'Detail customer berhasil diambil', data: customer };
  }

  async findFilter(query: CustomerFilterDto) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where: Prisma.CustomerWhereInput = {
      ...(query.customer_number
        ? { customer_number: query.customer_number }
        : {}),
      ...(buildSearchFilter(query.search, [
        'username',
        'name',
        'phone',
        'customer_number',
      ]) || {}),
    };

    const data = await this.prisma.customer.findMany({
      where,
      skip,
      take,
      select: this.publicFields(),
    });

    return { message: 'Filter customer berhasil diambil', data };
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const data: Prisma.CustomerUpdateInput = {
      address: dto.address,
      name: dto.name,
      phone: dto.phone,
    };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data,
      select: this.publicFields(),
    });

    return { message: 'Customer berhasil diupdate', data: customer };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer berhasil dihapus', data: { id } };
  }

  private publicFields() {
    return {
      id: true,
      username: true,
      customer_number: true,
      address: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    };
  }
}
