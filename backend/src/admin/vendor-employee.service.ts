import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVendorEmployeeDto,
  UpdateVendorEmployeeDto,
  VendorEmployeeFilterDto,
} from './dto/vendor-employee.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { hashPassword } from '../common/utils/password.util';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class VendorEmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendorEmployeeDto, adminId: number) {
    const exists = await this.prisma.vendorEmployee.findUnique({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException('Username vendor sudah digunakan');
    }

    const vendor = await this.prisma.vendorEmployee.create({
      data: {
        username: dto.username,
        password: await hashPassword(dto.password),
        name: dto.name,
        phone: dto.phone,
        transportType: dto.transportType,
        createdByAdminId: adminId,
      },
      select: this.selectFields(),
    });

    return { message: 'Vendor employee berhasil dibuat', data: vendor };
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = buildSearchFilter(query.search, ['username', 'name', 'phone']);

    const [items, total] = await Promise.all([
      this.prisma.vendorEmployee.findMany({
        where,
        skip,
        take,
        select: this.selectFields(),
        orderBy: { id: 'asc' },
      }),
      this.prisma.vendorEmployee.count({ where }),
    ]);

    return {
      message: 'Daftar vendor employee berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number) {
    const vendor = await this.prisma.vendorEmployee.findUnique({
      where: { id },
      select: this.selectFields(),
    });
    if (!vendor) {
      throw new NotFoundException('Vendor employee tidak ditemukan');
    }
    return { message: 'Detail vendor employee berhasil diambil', data: vendor };
  }

  async findFilter(query: VendorEmployeeFilterDto) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where: Prisma.VendorEmployeeWhereInput = {
      ...(query.transportType ? { transportType: query.transportType } : {}),
      ...(buildSearchFilter(query.search, ['username', 'name', 'phone']) || {}),
    };

    const data = await this.prisma.vendorEmployee.findMany({
      where,
      skip,
      take,
      select: this.selectFields(),
    });

    return { message: 'Filter vendor employee berhasil diambil', data };
  }

  async update(id: number, dto: UpdateVendorEmployeeDto) {
    await this.findOne(id);
    const data: Prisma.VendorEmployeeUpdateInput = {
      name: dto.name,
      phone: dto.phone,
      transportType: dto.transportType,
    };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }

    const vendor = await this.prisma.vendorEmployee.update({
      where: { id },
      data,
      select: this.selectFields(),
    });

    return { message: 'Vendor employee berhasil diupdate', data: vendor };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.vendorEmployee.delete({ where: { id } });
    return { message: 'Vendor employee berhasil dihapus', data: { id } };
  }

  async findByTransportType(transportType: TransportType, vendorId: number) {
    const vendor = await this.prisma.vendorEmployee.findFirst({
      where: { id: vendorId, transportType },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor tidak ditemukan untuk moda ini');
    }
    return vendor;
  }

  private selectFields() {
    return {
      id: true,
      username: true,
      name: true,
      phone: true,
      transportType: true,
      role: true,
      createdByAdminId: true,
      createdAt: true,
    };
  }
}
