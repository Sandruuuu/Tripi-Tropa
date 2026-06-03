import 'dotenv/config';
import { PrismaClient, ClassType, TransportType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function upsertSchedule(
  transportId: number,
  origin: string,
  destination: string,
  departureTime: Date,
  price: number,
) {
  const existing = await prisma.schedule.findFirst({
    where: { transportId, origin, destination, departureTime },
  });
  if (existing) return existing;
  return prisma.schedule.create({
    data: { transportId, origin, destination, departureTime, price },
  });
}

async function upsertCarriage(
  scheduleId: number,
  carriageNumber: string,
  classType: ClassType,
  seatNumbers: string[],
) {
  let carriage = await prisma.carriage.findFirst({
    where: { scheduleId, carriageNumber },
  });
  if (!carriage) {
    carriage = await prisma.carriage.create({
      data: {
        scheduleId,
        carriageNumber,
        classType,
        totalSeats: seatNumbers.length,
      },
    });
  }

  for (const seatNumber of seatNumbers) {
    await prisma.seat.upsert({
      where: {
        carriageId_seatNumber: { carriageId: carriage.id, seatNumber },
      },
      update: { isAvailable: true },
      create: { carriageId: carriage.id, seatNumber },
    });
  }

  return carriage;
}

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // 1. Admin
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      name: 'Admin TripiTropa',
      phone: '081234567890',
    },
  });

  // 2. Customer
  await prisma.customer.upsert({
    where: { username: 'customer' },
    update: {},
    create: {
      username: 'customer',
      password,
      customer_number: 'CUST-001',
      address: 'Jl. Sudirman No. 1, Jakarta',
      name: 'Budi Santoso',
      phone: '081298765432',
    },
  });

  // 3. Vendor
  const vendor = await prisma.vendorEmployee.upsert({
    where: { username: 'vendor_plane' },
    update: {},
    create: {
      username: 'vendor_plane',
      password,
      name: 'Staff Garuda',
      phone: '081335810890',
      transportType: TransportType.PLANE,
      createdByAdminId: admin.id,
    },
  });

  // 4. Transportation
  const plane = await prisma.transportation.upsert({
    where: { code: 'GA-330' },
    update: { vendorId: vendor.id },
    create: {
      type: TransportType.PLANE,
      name: 'Garuda Indonesia A330',
      code: 'GA-330',
      capacity: 180,
      vendorId: vendor.id,
    },
  });

  // 5. Schedule
  const schedule = await upsertSchedule(
    plane.id,
    'Surabaya',
    'Jakarta',
    new Date('2026-06-15T08:00:00Z'),
    850000,
  );

  // 6. Carriage & Seat (Hanya 1 Carriage dengan 1 Kursi)
  await upsertCarriage(schedule.id, 'Cabin-A', ClassType.ECONOMY, ['1A']);

  console.log('Seed TripiTropa selesai.');
  console.log('Admin: admin / 123456');
  console.log('Customer: customer / 123456');
  console.log('Vendor: vendor_plane / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });