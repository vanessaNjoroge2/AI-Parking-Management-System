import {
  PrismaClient,
  UserRole,
  PricingType,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedLotInput = {
  name: string;
  ownerId: string;
  latitude: number;
  longitude: number;
  capacityTotal: number;
  isGuarded: boolean;
  hasCctv: boolean;
  hasLighting: boolean;
  hourlyAmount: number;
  description?: string | null;
  addressText?: string | null;
  address?: string | null;
  isCovered?: boolean;
  wheelchairFriendly?: boolean;
};

type SeededLot = Prisma.ParkingLotGetPayload<{}> & {
  hourlyAmount: number;
};

function startOfCurrentYear() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1, 8, 0, 0, 0);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function makeBookingStatus(offsetDaysFromToday: number): BookingStatus {
  if (offsetDaysFromToday > 2) {
    return pickOne([
      BookingStatus.COMPLETED,
      BookingStatus.COMPLETED,
      BookingStatus.COMPLETED,
      BookingStatus.CHECKED_IN,
      BookingStatus.CONFIRMED,
    ]);
  }

  if (offsetDaysFromToday >= 0) {
    return pickOne([
      BookingStatus.CONFIRMED,
      BookingStatus.CHECKED_IN,
      BookingStatus.PENDING,
    ]);
  }

  return BookingStatus.CONFIRMED;
}

async function clearSeededOwnerLots(ownerIds: string[]) {
  const ownerLots = await prisma.parkingLot.findMany({
    where: { ownerId: { in: ownerIds } },
    select: { id: true },
  });

  const lotIds = ownerLots.map((lot) => lot.id);

  if (lotIds.length === 0) return;

  await prisma.payment.deleteMany({
    where: {
      booking: {
        parkingLotId: { in: lotIds },
      },
    },
  });

  await prisma.booking.deleteMany({
    where: {
      parkingLotId: { in: lotIds },
    },
  });

  await prisma.review.deleteMany({
    where: {
      parkingLotId: { in: lotIds },
    },
  });

  await prisma.parkingPhoto.deleteMany({
    where: {
      parkingLotId: { in: lotIds },
    },
  });

  await prisma.workingHour.deleteMany({
    where: {
      parkingLotId: { in: lotIds },
    },
  });

  await prisma.pricingRule.deleteMany({
    where: {
      parkingLotId: { in: lotIds },
    },
  });

  await prisma.parkingLot.deleteMany({
    where: {
      id: { in: lotIds },
    },
  });
}

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ---- EXACTLY 2 OWNERS + 2 DRIVERS ----
  const [owner1, owner2, driver1, driver2] = await prisma.$transaction([
    prisma.user.upsert({
      where: { phone: '0700000001' },
      update: {
        fullName: 'Owner One',
        password: passwordHash,
        role: UserRole.OWNER,
      },
      create: {
        fullName: 'Owner One',
        phone: '0700000001',
        password: passwordHash,
        role: UserRole.OWNER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000002' },
      update: {
        fullName: 'Owner Two',
        password: passwordHash,
        role: UserRole.OWNER,
      },
      create: {
        fullName: 'Owner Two',
        phone: '0700000002',
        password: passwordHash,
        role: UserRole.OWNER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000003' },
      update: {
        fullName: 'Driver One',
        password: passwordHash,
        role: UserRole.DRIVER,
      },
      create: {
        fullName: 'Driver One',
        phone: '0700000003',
        password: passwordHash,
        role: UserRole.DRIVER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '0700000004' },
      update: {
        fullName: 'Driver Two',
        password: passwordHash,
        role: UserRole.DRIVER,
      },
      create: {
        fullName: 'Driver Two',
        phone: '0700000004',
        password: passwordHash,
        role: UserRole.DRIVER,
      },
    }),
  ]);

  console.log('✅ Owners and drivers seeded');

  // ---- CLEAN OLD LOTS FOR THESE OWNERS TO AVOID DUPLICATES ----
  await clearSeededOwnerLots([owner1.id, owner2.id]);
  console.log('✅ Existing seeded lots cleared');

  // ---- SAME COORDINATES AS YOUR CURRENT SEEDER ----
  const parkingLotsSeed: SeedLotInput[] = [
    // Owner 1
    {
      name: 'Owner One Nairobi CBD Parking',
      ownerId: owner1.id,
      latitude: -1.2921,
      longitude: 36.8219,
      capacityTotal: 10,
      isGuarded: true,
      hasCctv: true,
      hasLighting: true,
      hourlyAmount: 250,
      addressText: 'Nairobi CBD',
      address: 'Nairobi CBD',
      description: 'Secure parking in Nairobi CBD',
    },
    {
      name: 'Owner One Upper Hill Parking',
      ownerId: owner1.id,
      latitude: -1.2985,
      longitude: 36.8172,
      capacityTotal: 8,
      isGuarded: true,
      hasCctv: true,
      hasLighting: true,
      hourlyAmount: 300,
      addressText: 'Upper Hill, Nairobi',
      address: 'Upper Hill',
      description: 'Executive parking in Upper Hill',
    },
    {
      name: 'Owner One Westlands Parking',
      ownerId: owner1.id,
      latitude: -1.2676,
      longitude: 36.8108,
      capacityTotal: 7,
      isGuarded: true,
      hasCctv: false,
      hasLighting: true,
      hourlyAmount: 220,
      addressText: 'Westlands, Nairobi',
      address: 'Westlands',
      description: 'Convenient parking in Westlands',
    },
    {
      name: 'Owner One Thika Town Parking',
      ownerId: owner1.id,
      latitude: -1.03326,
      longitude: 37.06933,
      capacityTotal: 6,
      isGuarded: true,
      hasCctv: false,
      hasLighting: true,
      hourlyAmount: 120,
      addressText: 'Thika Town',
      address: 'Thika',
      description: 'Town parking in Thika',
    },
    {
      name: 'Owner One Blue Post Parking',
      ownerId: owner1.id,
      latitude: -1.0341,
      longitude: 37.0702,
      capacityTotal: 5,
      isGuarded: false,
      hasCctv: true,
      hasLighting: true,
      hourlyAmount: 130,
      addressText: 'Blue Post, Thika',
      address: 'Blue Post',
      description: 'Blue Post area parking',
    },

    // Owner 2
    {
      name: 'Owner Two Nairobi Central Parking',
      ownerId: owner2.id,
      latitude: -1.2917,
      longitude: 36.8223,
      capacityTotal: 9,
      isGuarded: true,
      hasCctv: true,
      hasLighting: true,
      hourlyAmount: 240,
      addressText: 'Central Nairobi',
      address: 'Nairobi Central',
      description: 'Central Nairobi secure lot',
    },
    {
      name: 'Owner Two Kilimani Parking',
      ownerId: owner2.id,
      latitude: -1.2897,
      longitude: 36.7833,
      capacityTotal: 8,
      isGuarded: true,
      hasCctv: false,
      hasLighting: true,
      hourlyAmount: 210,
      addressText: 'Kilimani, Nairobi',
      address: 'Kilimani',
      description: 'Kilimani parking lot',
    },
    {
      name: 'Owner Two Parklands Parking',
      ownerId: owner2.id,
      latitude: -1.263,
      longitude: 36.8165,
      capacityTotal: 6,
      isGuarded: false,
      hasCctv: true,
      hasLighting: true,
      hourlyAmount: 200,
      addressText: 'Parklands, Nairobi',
      address: 'Parklands',
      description: 'Parklands secure parking',
    },
    {
      name: 'Owner Two Makongeni Parking',
      ownerId: owner2.id,
      latitude: -1.0329,
      longitude: 37.0688,
      capacityTotal: 5,
      isGuarded: true,
      hasCctv: false,
      hasLighting: true,
      hourlyAmount: 110,
      addressText: 'Makongeni, Thika',
      address: 'Makongeni',
      description: 'Makongeni area parking',
    },
    {
      name: 'Owner Two Thika Bypass Parking',
      ownerId: owner2.id,
      latitude: -1.035,
      longitude: 37.0711,
      capacityTotal: 7,
      isGuarded: true,
      hasCctv: true,
      hasLighting: false,
      hourlyAmount: 140,
      addressText: 'Thika Bypass',
      address: 'Thika Bypass',
      description: 'Parking near Thika Bypass',
    },
  ];

  const lots: SeededLot[] = [];

  for (const lot of parkingLotsSeed) {
    const savedLot = await prisma.parkingLot.create({
      data: {
        name: lot.name,
        ownerId: lot.ownerId,
        latitude: lot.latitude,
        longitude: lot.longitude,
        capacityTotal: lot.capacityTotal,
        isGuarded: lot.isGuarded,
        hasCctv: lot.hasCctv,
        hasLighting: lot.hasLighting,
        description: lot.description ?? null,
        addressText: lot.addressText ?? null,
        address: lot.address ?? null,
        isCovered: lot.isCovered ?? false,
        wheelchairFriendly: lot.wheelchairFriendly ?? false,
        isActive: true,
      },
    });

    lots.push({
      ...savedLot,
      hourlyAmount: lot.hourlyAmount,
    });
  }

  console.log('✅ Parking lots seeded');

  // ---- WORKING HOURS ----
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

  console.log('✅ Working hours seeded');

  // ---- PRICING RULES ----
  for (const lot of lots) {
    await prisma.pricingRule.create({
      data: {
        parkingLotId: lot.id,
        type: PricingType.HOURLY,
        amount: lot.hourlyAmount,
        currency: 'KES',
        isActive: true,
      },
    });
  }

  console.log('✅ Pricing rules seeded');

  // ---- BOOKINGS + PAYMENTS FROM JANUARY TO TODAY ----
  const drivers = [driver1, driver2];
  const startDate = startOfCurrentYear();
  const today = new Date();

  let bookingCount = 0;
  let paymentCount = 0;

  for (let cursor = new Date(startDate); cursor <= today; cursor = addDays(cursor, 1)) {
    const weekday = cursor.getDay();

    // fewer bookings on Sundays
    const dailyBookings =
      weekday === 0 ? randomInt(1, 3) : randomInt(3, 7);

    for (let i = 0; i < dailyBookings; i++) {
      const lot = pickOne(lots);
      const driver = pickOne(drivers);

      const startHour = randomInt(8, 16);
      const durationHours = randomInt(1, 3);

      const startTime = new Date(cursor);
      startTime.setHours(startHour, pickOne([0, 15, 30, 45]), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + durationHours);

      const daysDiff = Math.floor(
        (today.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24),
      );

      const status = makeBookingStatus(daysDiff);
      const numberOfCars = randomInt(1, 2);

      const booking = await prisma.booking.create({
        data: {
          userId: driver.id,
          parkingLotId: lot.id,
          startTime,
          endTime,
          numberOfCars,
          vehiclePlate: `K${randomInt(100, 999)}${String.fromCharCode(
            65 + randomInt(0, 25),
            65 + randomInt(0, 25),
            65 + randomInt(0, 25),
          )}`,
          preference: pickOne([
            'near-exit',
            'covered',
            'well-lit',
            'guarded',
            null,
          ]),
          status,
        },
      });

      bookingCount += 1;

      // only create successful payments for non-pending bookings
      if (
        status === BookingStatus.CONFIRMED ||
        status === BookingStatus.CHECKED_IN ||
        status === BookingStatus.COMPLETED
      ) {
        const amount = lot.hourlyAmount * durationHours * numberOfCars;

        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            method: pickOne([PaymentMethod.MPESA, PaymentMethod.CARD]),
            amount,
            currency: 'KES',
            status: PaymentStatus.SUCCESS,
            provider: 'KCB_BUNI',
            reference: `PAY-${booking.id.slice(0, 8)}-${startTime.getTime()}`,
            providerRef: `REF-${randomInt(100000, 999999)}`,
            phone: driver.phone,
            rawPayload: {
              seeded: true,
              lotName: lot.name,
              durationHours,
              numberOfCars,
            },
          },
        });

        paymentCount += 1;
      }
    }
  }

  console.log(`✅ Bookings seeded: ${bookingCount}`);
  console.log(`✅ Payments seeded: ${paymentCount}`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });