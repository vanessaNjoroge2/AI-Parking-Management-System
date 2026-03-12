import {
  PrismaClient,
  UserRole,
  PricingType,
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

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ---- ONLY 2 OWNERS ----
  const [owner1, owner2] = await prisma.$transaction([
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
  ]);

  console.log('✅ Owners seeded');

  // ---- EXACTLY 5 LOTS PER OWNER ----
  const parkingLotsSeed: SeedLotInput[] = [
    // Owner 1 - Nairobi + Thika
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

    // Owner 2 - Nairobi + Thika
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
    const existingLot = await prisma.parkingLot.findFirst({
      where: {
        name: lot.name,
        ownerId: lot.ownerId,
      },
    });

    let savedLot;

    if (existingLot) {
      savedLot = await prisma.parkingLot.update({
        where: { id: existingLot.id },
        data: {
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
    } else {
      savedLot = await prisma.parkingLot.create({
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
    }

    lots.push({
      ...savedLot,
      hourlyAmount: lot.hourlyAmount,
    });
  }

  console.log('✅ Parking lots seeded');

  // ---- WORKING HOURS: seed once only ----
  for (const lot of lots) {
    for (let day = 0; day <= 6; day++) {
      await prisma.workingHour.upsert({
        where: {
          parkingLotId_dayOfWeek: {
            parkingLotId: lot.id,
            dayOfWeek: day,
          },
        },
        update: {
          opensAt: '08:00',
          closesAt: '18:00',
          isClosed: false,
        },
        create: {
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

  // ---- PRICING RULES: only create if HOURLY rule does not exist ----
  for (const lot of lots) {
    const existingPricingRule = await prisma.pricingRule.findFirst({
      where: {
        parkingLotId: lot.id,
        type: PricingType.HOURLY,
      },
    });

    if (existingPricingRule) {
      await prisma.pricingRule.update({
        where: { id: existingPricingRule.id },
        data: {
          amount: lot.hourlyAmount,
          isActive: true,
        },
      });
    } else {
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
  }

  console.log('✅ Pricing rules seeded');
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
// import {
//   PrismaClient,
//   UserRole,
//   BookingStatus,
//   PricingType,
// } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database...');

//   const passwordHash = await bcrypt.hash('password123', 10);

//   // ---- USERS ----
//   const [owner1, owner2, driver1, driver2] = await prisma.$transaction([
//     prisma.user.upsert({
//       where: { phone: '0700000001' },
//       update: {},
//       create: {
//         fullName: 'Owner One',
//         phone: '0700000001',
//         password: passwordHash,
//         role: UserRole.OWNER,
//       },
//     }),
//     prisma.user.upsert({
//       where: { phone: '0700000002' },
//       update: {},
//       create: {
//         fullName: 'Owner Two',
//         phone: '0700000002',
//         password: passwordHash,
//         role: UserRole.OWNER,
//       },
//     }),
//     prisma.user.upsert({
//       where: { phone: '0700000003' },
//       update: {},
//       create: {
//         fullName: 'Driver One',
//         phone: '0700000003',
//         password: passwordHash,
//         role: UserRole.DRIVER,
//       },
//     }),
//     prisma.user.upsert({
//       where: { phone: '0700000004' },
//       update: {},
//       create: {
//         fullName: 'Driver Two',
//         phone: '0700000004',
//         password: passwordHash,
//         role: UserRole.DRIVER,
//       },
//     }),
//     prisma.user.upsert({
//       where: { phone: '0700000005' },
//       update: {},
//       create: {
//         fullName: 'Admin One',
//         phone: '0700000005',
//         password: passwordHash,
//         role: UserRole.ADMIN,
//       },
//     }),
//     prisma.user.upsert({
//       where: { phone: '0700000006' },
//       update: {},
//       create: {
//         fullName: 'Admin Two',
//         phone: '0700000006',
//         password: passwordHash,
//         role: UserRole.ADMIN,
//       },
//     }),
//   ]);

//   console.log('✅ Users created');

//   // ---- PARKING LOTS ----
//   const lots = await prisma.$transaction([
//     prisma.parkingLot.create({
//       data: {
//         name: 'CBD Secure Parking',
//         ownerId: owner1.id,
//         latitude: -1.286389,
//         longitude: 36.817223,
//         capacityTotal: 5,
//         isGuarded: true,
//         hasCctv: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Westlands Mall Parking',
//         ownerId: owner1.id,
//         latitude: -1.2676,
//         longitude: 36.8108,
//         capacityTotal: 3,
//         isGuarded: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Karen Shopping Center',
//         ownerId: owner2.id,
//         latitude: -1.3197,
//         longitude: 36.7073,
//         capacityTotal: 4,
//         hasLighting: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Airport Parking Lot',
//         ownerId: owner2.id,
//         latitude: -1.3192,
//         longitude: 36.9275,
//         capacityTotal: 6,
//         isGuarded: true,
//       },
//     }),
//     // ===== NAIROBI AREA =====
//     prisma.parkingLot.create({
//       data: {
//         name: 'Nairobi CBD Secure Parking',
//         ownerId: owner1.id,
//         latitude: -1.2905,
//         longitude: 36.8215,
//         capacityTotal: 10,
//         isGuarded: true,
//         hasCctv: true,
//         hasLighting: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Upper Hill Executive Parking',
//         ownerId: owner1.id,
//         latitude: -1.3,
//         longitude: 36.812,
//         capacityTotal: 8,
//         isGuarded: true,
//         hasCctv: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Parklands Secure Lot',
//         ownerId: owner2.id,
//         latitude: -1.27,
//         longitude: 36.83,
//         capacityTotal: 6,
//         hasLighting: true,
//       },
//     }),

//     // ===== THIKA AREA =====
//     prisma.parkingLot.create({
//       data: {
//         name: 'Thika Town Parking',
//         ownerId: owner2.id,
//         latitude: -1.05,
//         longitude: 37.06,
//         capacityTotal: 7,
//         isGuarded: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Blue Post Parking Lot',
//         ownerId: owner1.id,
//         latitude: -1.04,
//         longitude: 37.07,
//         capacityTotal: 5,
//         hasCctv: true,
//       },
//     }),
//     prisma.parkingLot.create({
//       data: {
//         name: 'Makongeni Secure Parking',
//         ownerId: owner2.id,
//         latitude: -1.0335,
//         longitude: 37.065,
//         capacityTotal: 4,
//         isGuarded: true,
//         hasLighting: true,
//       },
//     }),
//   ]);

//   console.log('✅ Parking lots created');

//   // ---- WORKING HOURS (8am–6pm daily) ----
//   for (const lot of lots) {
//     for (let day = 0; day <= 6; day++) {
//       await prisma.workingHour.create({
//         data: {
//           parkingLotId: lot.id,
//           dayOfWeek: day,
//           opensAt: '08:00',
//           closesAt: '18:00',
//           isClosed: false,
//         },
//       });
//     }
//   }

//   console.log('✅ Working hours created');

//   // ---- PRICING RULES ----
//   const hourlyPrices = [
//     250, // CBD Secure Parking
//     180, // Westlands Mall Parking
//     150, // Karen Shopping Center
//     300, // Airport Parking Lot
//     220, // Nairobi CBD Secure Parking
//     350, // Upper Hill Executive Parking
//     170, // Parklands Secure Lot
//     100, // Thika Town Parking
//     120, // Blue Post Parking Lot
//     140, // Makongeni Secure Parking
//   ];

//   for (const [index, lot] of lots.entries()) {
//     await prisma.pricingRule.create({
//       data: {
//         parkingLotId: lot.id,
//         type: PricingType.HOURLY,
//         amount: hourlyPrices[index] ?? 200,
//       },
//     });
//   }

//   console.log('✅ Pricing rules created');

//   // ---- BOOKINGS ----
//   await prisma.booking.createMany({
//     data: [
//       {
//         userId: driver1.id,
//         parkingLotId: lots[0].id,
//         startTime: new Date('2026-02-25T09:00:00Z'),
//         endTime: new Date('2026-02-25T11:00:00Z'),
//         status: BookingStatus.CONFIRMED,
//       },
//       {
//         userId: driver2.id,
//         parkingLotId: lots[0].id,
//         startTime: new Date('2026-02-25T09:30:00Z'),
//         endTime: new Date('2026-02-25T10:30:00Z'),
//         status: BookingStatus.PENDING,
//       },
//       {
//         userId: driver1.id,
//         parkingLotId: lots[1].id,
//         startTime: new Date('2026-02-26T10:00:00Z'),
//         endTime: new Date('2026-02-26T12:00:00Z'),
//         status: BookingStatus.CONFIRMED,
//       },
//       {
//         userId: driver2.id,
//         parkingLotId: lots[2].id,
//         startTime: new Date('2026-02-27T08:00:00Z'),
//         endTime: new Date('2026-02-27T09:00:00Z'),
//         status: BookingStatus.PENDING,
//       },
//     ],
//   });

//   console.log('✅ Bookings created');

//   console.log('🌱 Seeding complete!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
