import {
  PrismaClient,
  UserRole,
  BookingStatus,
  PricingType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ---- USERS ----
  const [owner1, owner2, driver1, driver2] = await prisma.$transaction([
    prisma.user.upsert({
      where: { phone: '0700000001' },
      update: {},
      create: {
        fullName: 'Owner One',
        phone: '0700000001',
        password: passwordHash,
        role: UserRole.OWNER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000002' },
      update: {},
      create: {
        fullName: 'Owner Two',
        phone: '0700000002',
        password: passwordHash,
        role: UserRole.OWNER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000003' },
      update: {},
      create: {
        fullName: 'Driver One',
        phone: '0700000003',
        password: passwordHash,
        role: UserRole.DRIVER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000004' },
      update: {},
      create: {
        fullName: 'Driver Two',
        phone: '0700000004',
        password: passwordHash,
        role: UserRole.DRIVER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000005' },
      update: {},
      create: {
        fullName: 'Admin One',
        phone: '0700000005',
        password: passwordHash,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000006' },
      update: {},
      create: {
        fullName: 'Admin Two',
        phone: '0700000006',
        password: passwordHash,
        role: UserRole.ADMIN,
      },
    }),
  ]);

  console.log('✅ Users created');

  // ---- PARKING LOTS ----
  const lots = await prisma.$transaction([
    prisma.parkingLot.create({
      data: {
        name: 'CBD Secure Parking',
        ownerId: owner1.id,
        latitude: -1.286389,
        longitude: 36.817223,
        capacityTotal: 5,
        isGuarded: true,
        hasCctv: true,
      },
    }),
    prisma.parkingLot.create({
      data: {
        name: 'Westlands Mall Parking',
        ownerId: owner1.id,
        latitude: -1.2676,
        longitude: 36.8108,
        capacityTotal: 3,
        isGuarded: true,
      },
    }),
    prisma.parkingLot.create({
      data: {
        name: 'Karen Shopping Center',
        ownerId: owner2.id,
        latitude: -1.3197,
        longitude: 36.7073,
        capacityTotal: 4,
        hasLighting: true,
      },
    }),
    prisma.parkingLot.create({
      data: {
        name: 'Airport Parking Lot',
        ownerId: owner2.id,
        latitude: -1.3192,
        longitude: 36.9275,
        capacityTotal: 6,
        isGuarded: true,
      },
    }),
  ]);

  console.log('✅ Parking lots created');

  // ---- WORKING HOURS (8am–6pm daily) ----
  for (const lot of lots) {
    for (let day = 0; day <= 6; day++) {
      await prisma.workingHour.create({
        data: {
          parkingLotId: lot.id,
          dayOfWeek: day,
          opensAt: '08:00',
          closesAt: '18:00',
          isClosed: false,
        },
      });
    }
  }

  console.log('✅ Working hours created');

  // ---- PRICING RULES ----
  for (const lot of lots) {
    await prisma.pricingRule.create({
      data: {
        parkingLotId: lot.id,
        type: PricingType.HOURLY,
        amount: 200,
      },
    });
  }

  console.log('✅ Pricing rules created');

  // ---- BOOKINGS ----
  await prisma.booking.createMany({
    data: [
      {
        userId: driver1.id,
        parkingLotId: lots[0].id,
        startTime: new Date('2026-02-25T09:00:00Z'),
        endTime: new Date('2026-02-25T11:00:00Z'),
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: driver2.id,
        parkingLotId: lots[0].id,
        startTime: new Date('2026-02-25T09:30:00Z'),
        endTime: new Date('2026-02-25T10:30:00Z'),
        status: BookingStatus.PENDING,
      },
      {
        userId: driver1.id,
        parkingLotId: lots[1].id,
        startTime: new Date('2026-02-26T10:00:00Z'),
        endTime: new Date('2026-02-26T12:00:00Z'),
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: driver2.id,
        parkingLotId: lots[2].id,
        startTime: new Date('2026-02-27T08:00:00Z'),
        endTime: new Date('2026-02-27T09:00:00Z'),
        status: BookingStatus.PENDING,
      },
    ],
  });

  console.log('✅ Bookings created');

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
