import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { hashPassword } from '../common/utils/password.util';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdminDto) {
    const exists = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException('Username admin sudah digunakan');
    }

    const admin = await this.prisma.admin.create({
      data: {
        ...dto,
        password: await hashPassword(dto.password),
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return { message: 'Admin berhasil dibuat', data: admin };
  }

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const searchFilter = buildSearchFilter(query.search, [
      'username',
      'name',
      'phone',
    ]);

    const [data, total] = await Promise.all([
      this.prisma.admin.findMany({
        where: searchFilter,
        skip,
        take,
        select: {
          id: true,
          username: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.admin.count({ where: searchFilter }),
    ]);

    return {
      message: 'Daftar admin berhasil diambil',
      data: { items: data, page, quantity, total },
    };
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    if (!admin) {
      throw new NotFoundException('Admin tidak ditemukan');
    }
    return { message: 'Detail admin berhasil diambil', data: admin };
  }

  async findFilter(query: PaginationQueryDto & { username?: string }) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = {
      ...(query.username ? { username: query.username } : {}),
      ...(buildSearchFilter(query.search, ['username', 'name', 'phone']) || {}),
    };

    const data = await this.prisma.admin.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    return { message: 'Filter admin berhasil diambil', data };
  }

  async update(id: number, dto: UpdateAdminDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }

    const admin = await this.prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    return { message: 'Admin berhasil diupdate', data: admin };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.admin.delete({ where: { id } });
    return { message: 'Admin berhasil dihapus', data: { id } };
  }
}
