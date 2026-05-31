import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from '../common/utils/password.util';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<ServiceResponse<{ token: string }>> {
    const { username, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (admin && (await comparePassword(password, admin.password))) {
      return this.buildToken(admin.id, admin.username, Role.ADMIN);
    }

    const customer = await this.prisma.customer.findUnique({
      where: { username },
    });
    if (customer && (await comparePassword(password, customer.password))) {
      return this.buildToken(customer.id, customer.username, Role.CUSTOMER);
    }

    const vendor = await this.prisma.vendorEmployee.findUnique({
      where: { username },
    });
    if (vendor && (await comparePassword(password, vendor.password))) {
      return this.buildToken(
        vendor.id,
        vendor.username,
        Role.VENDOR,
        vendor.transportType,
      );
    }

    throw new UnauthorizedException('Username atau password salah');
  }

  private buildToken(
    id: number,
    username: string,
    role: Role,
    transportType?: string,
  ): ServiceResponse<{ token: string }> {
    const payload = { sub: id, username, role, transportType };
    return {
      message: 'Login berhasil',
      data: { token: this.jwtService.sign(payload) },
    };
  }
}
