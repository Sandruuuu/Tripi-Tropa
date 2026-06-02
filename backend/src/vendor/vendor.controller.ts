import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/jwt-payload.interface';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';
import { VendorEmployeeService } from '../admin/vendor-employee.service';

@ApiTags('Vendors')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorController {
  constructor(private readonly vendorEmployeeService: VendorEmployeeService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.vendorEmployeeService.findOne(user.id);
  }
}
