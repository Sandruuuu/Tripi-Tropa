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
  const password = await bcrypt.hash('password123', 10);

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

  const vendors = await Promise.all(
    [
      { username: 'vendor_plane', type: TransportType.PLANE, name: 'Staff Garuda' },
      { username: 'vendor_bus', type: TransportType.BUS, name: 'Staff PO Harapan' },
      { username: 'vendor_ship', type: TransportType.SHIP, name: 'Staff PELNI' },
    ].map((v) =>
      prisma.vendorEmployee.upsert({
        where: { username: v.username },
        update: {},
        create: {
          username: v.username,
          password,
          name: v.name,
          phone: '081335810890',
          transportType: v.type,
          createdByAdminId: admin.id,
        },
      }),
    ),
  );

  const planeVendor = vendors.find((v) => v.transportType === TransportType.PLANE)!;
  const busVendor = vendors.find((v) => v.transportType === TransportType.BUS)!;
  const shipVendor = vendors.find((v) => v.transportType === TransportType.SHIP)!;

  const plane = await prisma.transportation.upsert({
    where: { code: 'GA-330' },
    update: { vendorId: planeVendor.id },
    create: {
      type: TransportType.PLANE,
      name: 'Garuda Indonesia A330',
      code: 'GA-330',
      capacity: 180,
      vendorId: planeVendor.id,
    },
  });

  const plane2 = await prisma.transportation.upsert({
    where: { code: 'QG-256' },
    update: { vendorId: planeVendor.id },
    create: {
      type: TransportType.PLANE,
      name: 'Citilink A320',
      code: 'QG-256',
      capacity: 156,
      vendorId: planeVendor.id,
    },
  });

  const bus = await prisma.transportation.upsert({
    where: { code: 'PO-HJ' },
    update: { vendorId: busVendor.id },
    create: {
      type: TransportType.BUS,
      name: 'PO Harapan Jaya',
      code: 'PO-HJ',
      capacity: 40,
      vendorId: busVendor.id,
    },
  });

  const ship = await prisma.transportation.upsert({
    where: { code: 'KM-KELUD' },
    update: { vendorId: shipVendor.id },
    create: {
      type: TransportType.SHIP,
      name: 'KM Kelud',
      code: 'KM-KELUD',
      capacity: 120,
      vendorId: shipVendor.id,
    },
  });

  const planeSchedules = await Promise.all([
    upsertSchedule(
      plane.id,
      'Surabaya',
      'Jakarta',
      new Date('2026-06-15T08:00:00Z'),
      850000,
    ),
    upsertSchedule(
      plane.id,
      'Jakarta',
      'Denpasar',
      new Date('2026-06-16T10:30:00Z'),
      1250000,
    ),
    upsertSchedule(
      plane2.id,
      'Jakarta',
      'Denpasar',
      new Date('2026-06-17T06:00:00Z'),
      980000,
    ),
    upsertSchedule(
      plane2.id,
      'Surabaya',
      'Jakarta',
      new Date('2026-06-18T14:00:00Z'),
      720000,
    ),
  ]);

  const busSchedule = await upsertSchedule(
    bus.id,
    'Malang',
    'Surabaya',
    new Date('2026-06-15T06:00:00Z'),
    75000,
  );

  await upsertSchedule(
    bus.id,
    'Jakarta',
    'Bandung',
    new Date('2026-06-15T09:00:00Z'),
    95000,
  );

  const shipSchedule = await upsertSchedule(
    ship.id,
    'Surabaya',
    'Balikpapan',
    new Date('2026-06-20T18:00:00Z'),
    350000,
  );

  await upsertSchedule(
    ship.id,
    'Jakarta',
    'Makassar',
    new Date('2026-06-22T20:00:00Z'),
    480000,
  );

  for (const s of planeSchedules) {
    await upsertCarriage(s.id, 'Cabin-A', ClassType.ECONOMY, [
      '1A',
      '1B',
      '2A',
      '2B',
      '3A',
      '3B',
    ]);
    await upsertCarriage(s.id, 'Cabin-B', ClassType.BUSINESS, ['1A', '1B', '2A']);
  }

  await upsertCarriage(busSchedule.id, 'Deck-1', ClassType.ECONOMY, [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
  ]);

  await upsertCarriage(shipSchedule.id, 'Deck-3', ClassType.ECONOMY, [
    'Bunk-A',
    'Bunk-B',
    'Bunk-C',
    'Bunk-D',
  ]);

  console.log('Seed TripiTropa selesai.');
  console.log('Admin: admin / password123');
  console.log('Customer: customer / password123');
  console.log('Vendor plane: vendor_plane / password123');
  console.log('Vendor bus: vendor_bus / password123');
  console.log('Vendor ship: vendor_ship / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
