import { PrismaClient, ClassType, TransportType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
    update: {},
    create: {
      type: TransportType.PLANE,
      name: 'Garuda Indonesia A330',
      code: 'GA-330',
      capacity: 180,
      vendorId: planeVendor.id,
    },
  });

  const bus = await prisma.transportation.upsert({
    where: { code: 'PO-HJ' },
    update: {},
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
    update: {},
    create: {
      type: TransportType.SHIP,
      name: 'KM Kelud',
      code: 'KM-KELUD',
      capacity: 120,
      vendorId: shipVendor.id,
    },
  });

  const planeSchedule = await prisma.schedule.create({
    data: {
      transportId: plane.id,
      origin: 'Surabaya',
      destination: 'Jakarta',
      departureTime: new Date('2026-06-15T08:00:00Z'),
      price: 850000,
    },
  });

  const busSchedule = await prisma.schedule.create({
    data: {
      transportId: bus.id,
      origin: 'Malang',
      destination: 'Surabaya',
      departureTime: new Date('2026-06-15T06:00:00Z'),
      price: 75000,
    },
  });

  const shipSchedule = await prisma.schedule.create({
    data: {
      transportId: ship.id,
      origin: 'Surabaya',
      destination: 'Balikpapan',
      departureTime: new Date('2026-06-20T18:00:00Z'),
      price: 350000,
    },
  });

  async function seedSeats(
    scheduleId: number,
    carriageNumber: string,
    classType: ClassType,
    seatNumbers: string[],
  ) {
    const carriage = await prisma.carriage.create({
      data: {
        scheduleId,
        carriageNumber,
        classType,
        totalSeats: seatNumbers.length,
      },
    });

    await prisma.seat.createMany({
      data: seatNumbers.map((seatNumber) => ({
        carriageId: carriage.id,
        seatNumber,
      })),
    });
  }

  await seedSeats(planeSchedule.id, 'Cabin-A', ClassType.ECONOMY, ['1A', '1B', '2A', '2B']);
  await seedSeats(planeSchedule.id, 'Cabin-B', ClassType.BUSINESS, ['1A', '1B']);
  await seedSeats(busSchedule.id, 'Deck-1', ClassType.ECONOMY, ['1', '2', '3', '4']);
  await seedSeats(shipSchedule.id, 'Deck-3', ClassType.ECONOMY, ['Bunk-A', 'Bunk-B', 'Bunk-C']);

  console.log('Seed TripiTropa selesai.');
  console.log('Admin: admin / password123');
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
