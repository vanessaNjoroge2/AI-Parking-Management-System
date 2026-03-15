import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AnalyticsRepository } from '../../../shared/database/repository/analytics/analytics.repository';
import PDFDocument = require('pdfkit');

@Injectable()
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  async ownerSummary(user: { userId: string; role: string }, date?: string) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    return this.repo.getOwnerSummary(user.userId, start, end);
  }

  async bookingsPerHour(user: { userId: string; role: string }, date?: string) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.repo.getOwnerBookings(user.userId, start, end);

    const hourlyMap = new Map<
      number,
      { hour: string; bookings: number; cars: number }
    >();

    for (let h = 0; h < 24; h++) {
      hourlyMap.set(h, {
        hour: `${String(h).padStart(2, '0')}:00`,
        bookings: 0,
        cars: 0,
      });
    }

    for (const booking of bookings) {
      const hour = new Date(booking.startTime).getHours();
      const current = hourlyMap.get(hour);

      if (current) {
        current.bookings += 1;
        current.cars += booking.numberOfCars;
      }
    }

    const points = Array.from(hourlyMap.values());
    const peak = points.reduce((max, curr) =>
      curr.bookings > max.bookings ? curr : max,
    );

    return {
      date: start.toISOString().split('T')[0],
      points,
      peakHour: peak.hour,
    };
  }

  async dailyRevenue(
    user: { userId: string; role: string },
    from?: string,
    to?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const payments = await this.repo.getOwnerSuccessfulPayments(
      user.userId,
      start,
      end,
    );

    const dayMap = new Map<string, number>();

    for (const payment of payments) {
      const day = payment.createdAt.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + payment.amount);
    }

    const points = Array.from(dayMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0],
      currency: 'KES',
      points,
    };
  }

  async parkingLotCapacity(
    parkingLotId: string,
    startTime: string,
    endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    if (isNaN(end.getTime())) {
      throw new BadRequestException('Invalid endTime');
    }

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const result = await this.repo.getParkingLotCapacityUsage(
      parkingLotId,
      start,
      end,
    );

    if (!result.lot) {
      throw new NotFoundException('Parking lot not found');
    }

    const capacityLeft = Math.max(
      result.lot.capacityTotal - result.carsBooked,
      0,
    );

    return {
      parkingLotId: result.lot.id,
      parkingLotName: result.lot.name,
      capacityTotal: result.lot.capacityTotal,
      carsBooked: result.carsBooked,
      capacityLeft,
      startTime: start,
      endTime: end,
    };
  }

  async carsPerDay(
    user: { userId: string; role: string },
    from?: string,
    to?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.repo.getOwnerBookingsInRange(
      user.userId,
      start,
      end,
    );

    const dayMap = new Map<string, number>();

    for (const booking of bookings) {
      const day = booking.startTime.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + booking.numberOfCars);
    }

    const points = Array.from(dayMap.entries()).map(([date, cars]) => ({
      date,
      cars,
    }));

    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0],
      points,
    };
  }

  async parkingLotStats(
    user: { userId: string; role: string },
    parkingLotId: string,
    date?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    const result = await this.repo.getParkingLotStats(
      user.userId,
      parkingLotId,
      start,
      end,
    );

    if (!result.lot) {
      throw new NotFoundException('Parking lot not found');
    }

    return {
      parkingLotId: result.lot.id,
      parkingLotName: result.lot.name,
      capacityTotal: result.lot.capacityTotal,
      isActive: result.lot.isActive,
      date: start.toISOString().split('T')[0],
      totalBookings: result.totalBookings,
      totalCars: result.totalCars,
      totalRevenue: result.totalRevenue,
      currency: 'KES',
    };
  }
  async ownerReportData(
    user: { userId: string; role: string; fullName?: string },
    from?: string,
    to?: string,
    parkingLotId?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can download reports');
    }

    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      throw new BadRequestException(
        'Invalid date range: "to" must be after "from"',
      );
    }

    const [summary, bookings, payments, lots] = await Promise.all([
      this.repo.getOwnerSummary(user.userId, start, end),
      this.repo.getOwnerBookingsInRange(user.userId, start, end),
      this.repo.getOwnerSuccessfulPayments(user.userId, start, end),
      this.repo.getOwnerParkingLots(user.userId),
    ]);

    const filteredBookings = parkingLotId
      ? bookings.filter((booking) => booking.parkingLotId === parkingLotId)
      : bookings;

    const filteredPayments = parkingLotId
      ? payments.filter(
          (payment) => payment.booking.parkingLotId === parkingLotId,
        )
      : payments;

    const filteredLots = parkingLotId
      ? lots.filter((lot) => lot.id === parkingLotId)
      : lots;

    const totalBookings = filteredBookings.length;
    const totalCars = filteredBookings.reduce(
      (sum, booking) => sum + (booking.numberOfCars ?? 0),
      0,
    );

    const totalRevenue = filteredPayments.reduce(
      (sum, payment) => sum + (payment.amount ?? 0),
      0,
    );

    const totalCapacity = filteredLots.reduce(
      (sum, lot) => sum + (lot.capacityTotal ?? 0),
      0,
    );

    const occupancyRate =
      totalCapacity > 0 ? Math.round((totalCars / totalCapacity) * 100) : 0;

    const revenueByDayMap = new Map<string, number>();
    for (const payment of filteredPayments) {
      const day = payment.createdAt.toISOString().split('T')[0];
      revenueByDayMap.set(
        day,
        (revenueByDayMap.get(day) ?? 0) + payment.amount,
      );
    }

    const revenueByDay = Array.from(revenueByDayMap.entries()).map(
      ([date, revenue]) => ({
        date,
        revenue,
      }),
    );

    const hourlyMap = new Map<
      number,
      { hour: string; bookings: number; cars: number }
    >();
    for (let h = 0; h < 24; h++) {
      hourlyMap.set(h, {
        hour: `${String(h).padStart(2, '0')}:00`,
        bookings: 0,
        cars: 0,
      });
    }

    for (const booking of filteredBookings) {
      const hour = new Date(booking.startTime).getHours();
      const current = hourlyMap.get(hour);
      if (current) {
        current.bookings += 1;
        current.cars += booking.numberOfCars ?? 0;
      }
    }

    const hourlyPoints = Array.from(hourlyMap.values());
    const peakHour =
      hourlyPoints.length > 0
        ? hourlyPoints.reduce((max, curr) =>
            curr.bookings > max.bookings ? curr : max,
          ).hour
        : '--:--';

    const perLotStats = filteredLots.map((lot) => {
      const lotBookings = filteredBookings.filter(
        (booking) => booking.parkingLotId === lot.id,
      );

      const lotRevenue = filteredPayments
        .filter((payment) => payment.booking.parkingLotId === lot.id)
        .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);

      const lotCars = lotBookings.reduce(
        (sum, booking) => sum + (booking.numberOfCars ?? 0),
        0,
      );

      return {
        parkingLotId: lot.id,
        parkingLotName: lot.name,
        capacityTotal: lot.capacityTotal,
        isActive: lot.isActive,
        totalBookings: lotBookings.length,
        totalCars: lotCars,
        totalRevenue: lotRevenue,
      };
    });

    return {
      ownerId: user.userId,
      ownerName: user.fullName ?? 'Owner Account',
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0],
      facilityFilter: parkingLotId ?? 'all',
      summary: {
        ...summary,
        totalFacilities: filteredLots.length,
        totalBookings,
        totalCars,
        totalRevenue,
        occupancyRate,
        peakHour,
      },
      revenueByDay,
      hourlyPoints,
      perLotStats,
    };
  }

  async generateOwnerReportCsv(
    user: { userId: string; role: string; fullName?: string },
    from?: string,
    to?: string,
    parkingLotId?: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const report = await this.ownerReportData(user, from, to, parkingLotId);

    const headers = [
      'Owner ID',
      'Owner Name',
      'From',
      'To',
      'Parking Lot ID',
      'Parking Lot Name',
      'Is Active',
      'Capacity',
      'Total Bookings',
      'Total Cars',
      'Total Revenue (KES)',
    ];

    const rows = report.perLotStats.map((lot) => [
      report.ownerId,
      report.ownerName,
      report.from,
      report.to,
      lot.parkingLotId,
      lot.parkingLotName,
      lot.isActive ? 'Yes' : 'No',
      lot.capacityTotal,
      lot.totalBookings,
      lot.totalCars,
      lot.totalRevenue,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n',
    );

    const buffer = Buffer.from(csv, 'utf-8');

    const fileName = `parksmart-owner-report-${report.from}-to-${report.to}.csv`;

    return { buffer, fileName };
  }
  async generateOwnerReportPdf(
    user: { userId: string; role: string; fullName?: string },
    from?: string,
    to?: string,
    parkingLotId?: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const report = await this.ownerReportData(user, from, to, parkingLotId);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    const addTitle = (title: string, subtitle?: string) => {
      doc.fontSize(20).fillColor('#111827').text(title);
      if (subtitle) {
        doc.moveDown(0.3).fontSize(10).fillColor('#6B7280').text(subtitle);
      }
      doc.moveDown(1);
    };

    const addSectionTitle = (title: string) => {
      ensurePageSpace(40);
      doc.moveDown(0.5).fontSize(14).fillColor('#111827').text(title);
      doc.moveDown(0.5);
    };

    const addKeyValue = (label: string, value: string) => {
      ensurePageSpace(20);
      doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text(`${label}: `, { continued: true })
        .fillColor('#111827')
        .text(value);
    };

    const ensurePageSpace = (needed = 40) => {
      const bottom = doc.page.height - doc.page.margins.bottom;
      if (doc.y + needed > bottom) {
        doc.addPage();
      }
    };

    const addTableRow = (
      columns: string[],
      widths: number[],
      options?: { header?: boolean },
    ) => {
      ensurePageSpace(24);

      const startX = doc.page.margins.left;
      const startY = doc.y;
      const rowHeight = 20;
      const totalWidth = widths.reduce((a, b) => a + b, 0);

      if (options?.header) {
        doc.rect(startX, startY, totalWidth, rowHeight).fill('#F3F4F6');
      }

      let x = startX;

      columns.forEach((col, index) => {
        doc
          .fillColor('#111827')
          .fontSize(9)
          .text(col, x + 4, startY + 5, {
            width: widths[index] - 8,
            align: 'left',
            lineBreak: false,
          });

        x += widths[index];
      });

      doc.y = startY + rowHeight + 4;
    };

    addTitle(
      'ParkSmart Owner Performance Report',
      `Generated on ${new Date().toLocaleString()}`,
    );

    addSectionTitle('Report Details');
    addKeyValue('Owner ID', report.ownerId);
    addKeyValue('Owner Name', report.ownerName);
    addKeyValue('Date Range', `${report.from} to ${report.to}`);
    addKeyValue(
      'Facility Filter',
      report.facilityFilter === 'all'
        ? 'All Facilities'
        : report.facilityFilter,
    );

    doc.moveDown();

    addSectionTitle('Summary Statistics');
    addKeyValue('Total Facilities', String(report.summary.totalFacilities));
    addKeyValue(
      'Active Parking Lots',
      String(report.summary.activeParkingLots ?? 0),
    );
    addKeyValue('Total Bookings', String(report.summary.totalBookings));
    addKeyValue('Total Cars', String(report.summary.totalCars));
    addKeyValue(
      'Total Revenue',
      `KES ${report.summary.totalRevenue.toLocaleString()}`,
    );
    addKeyValue('Occupancy Rate', `${report.summary.occupancyRate}%`);
    addKeyValue('Peak Hour', report.summary.peakHour);

    doc.moveDown();

    addSectionTitle('Revenue By Day');
    if (report.revenueByDay.length === 0) {
      ensurePageSpace(20);
      doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text('No revenue data available for this range.');
    } else {
      addTableRow(['Date', 'Revenue (KES)'], [250, 200], { header: true });
      report.revenueByDay.forEach((item) => {
        addTableRow([item.date, item.revenue.toLocaleString()], [250, 200]);
      });
    }

    doc.moveDown();

    addSectionTitle('Hourly Booking Activity');
    addTableRow(['Hour', 'Bookings', 'Cars'], [150, 150, 150], {
      header: true,
    });
    report.hourlyPoints.forEach((item) => {
      addTableRow(
        [item.hour, String(item.bookings), String(item.cars)],
        [150, 150, 150],
      );
    });

    doc.moveDown();

    addSectionTitle('Parking Lot Performance');
    if (report.perLotStats.length === 0) {
      ensurePageSpace(20);
      doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text('No parking lot data available.');
    } else {
      addTableRow(
        ['Lot', 'Status', 'Capacity', 'Bookings', 'Cars', 'Revenue'],
        [140, 70, 70, 70, 50, 90],
        { header: true },
      );

      report.perLotStats.forEach((lot) => {
        addTableRow(
          [
            lot.parkingLotName,
            lot.isActive ? 'Active' : 'Inactive',
            String(lot.capacityTotal),
            String(lot.totalBookings),
            String(lot.totalCars),
            `KES ${lot.totalRevenue.toLocaleString()}`,
          ],
          [140, 70, 70, 70, 50, 90],
        );
      });
    }

    ensurePageSpace(20);
    doc
      .fontSize(9)
      .fillColor('#9CA3AF')
      .text('ParkSmart Analytics Report', { align: 'center' });

    doc.end();

    const buffer = await pdfBufferPromise;
    const fileName = `parksmart-owner-report-${report.from}-to-${report.to}.pdf`;

    return { buffer, fileName };
  }
  // async ownerReportData(
  //   user: { userId: string; role: string; fullName?: string },
  //   from?: string,
  //   to?: string,
  //   parkingLotId?: string,
  // ) {
  //   if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
  //     throw new ForbiddenException('Only owners can download reports');
  //   }

  //   const start = from ? new Date(from) : new Date();
  //   const end = to ? new Date(to) : new Date();

  //   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  //     throw new BadRequestException('Invalid date range');
  //   }

  //   start.setHours(0, 0, 0, 0);
  //   end.setHours(23, 59, 59, 999);

  //   if (end < start) {
  //     throw new BadRequestException(
  //       'Invalid date range: "to" must be after "from"',
  //     );
  //   }

  //   const [summary, bookings, payments, lots] = await Promise.all([
  //     this.repo.getOwnerSummary(user.userId, start, end),
  //     this.repo.getOwnerBookingsInRange(user.userId, start, end),
  //     this.repo.getOwnerSuccessfulPayments(user.userId, start, end),
  //     this.repo.getOwnerParkingLots(user.userId),
  //   ]);

  //   const filteredBookings = parkingLotId
  //     ? bookings.filter((booking) => booking.parkingLotId === parkingLotId)
  //     : bookings;

  //   const filteredPayments = parkingLotId
  //     ? payments.filter(
  //         (payment) => payment.booking.parkingLotId === parkingLotId,
  //       )
  //     : payments;

  //   const filteredLots = parkingLotId
  //     ? lots.filter((lot) => lot.id === parkingLotId)
  //     : lots;

  //   const totalBookings = filteredBookings.length;
  //   const totalCars = filteredBookings.reduce(
  //     (sum, booking) => sum + (booking.numberOfCars ?? 0),
  //     0,
  //   );

  //   const totalRevenue = filteredPayments.reduce(
  //     (sum, payment) => sum + (payment.amount ?? 0),
  //     0,
  //   );

  //   const totalCapacity = filteredLots.reduce(
  //     (sum, lot) => sum + (lot.capacityTotal ?? 0),
  //     0,
  //   );

  //   const occupancyRate =
  //     totalCapacity > 0 ? Math.round((totalCars / totalCapacity) * 100) : 0;

  //   const revenueByDayMap = new Map<string, number>();
  //   for (const payment of filteredPayments) {
  //     const day = payment.createdAt.toISOString().split('T')[0];
  //     revenueByDayMap.set(
  //       day,
  //       (revenueByDayMap.get(day) ?? 0) + payment.amount,
  //     );
  //   }

  //   const revenueByDay = Array.from(revenueByDayMap.entries()).map(
  //     ([date, revenue]) => ({
  //       date,
  //       revenue,
  //     }),
  //   );

  //   const hourlyMap = new Map<
  //     number,
  //     { hour: string; bookings: number; cars: number }
  //   >();
  //   for (let h = 0; h < 24; h++) {
  //     hourlyMap.set(h, {
  //       hour: `${String(h).padStart(2, '0')}:00`,
  //       bookings: 0,
  //       cars: 0,
  //     });
  //   }

  //   for (const booking of filteredBookings) {
  //     const hour = new Date(booking.startTime).getHours();
  //     const current = hourlyMap.get(hour);
  //     if (current) {
  //       current.bookings += 1;
  //       current.cars += booking.numberOfCars ?? 0;
  //     }
  //   }

  //   const hourlyPoints = Array.from(hourlyMap.values());
  //   const peakHour =
  //     hourlyPoints.length > 0
  //       ? hourlyPoints.reduce((max, curr) =>
  //           curr.bookings > max.bookings ? curr : max,
  //         ).hour
  //       : '--:--';

  //   const perLotStats = filteredLots.map((lot) => {
  //     const lotBookings = filteredBookings.filter(
  //       (booking) => booking.parkingLotId === lot.id,
  //     );

  //     const lotRevenue = filteredPayments
  //       .filter((payment) => payment.booking.parkingLotId === lot.id)
  //       .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);

  //     const lotCars = lotBookings.reduce(
  //       (sum, booking) => sum + (booking.numberOfCars ?? 0),
  //       0,
  //     );

  //     return {
  //       parkingLotId: lot.id,
  //       parkingLotName: lot.name,
  //       capacityTotal: lot.capacityTotal,
  //       isActive: lot.isActive,
  //       totalBookings: lotBookings.length,
  //       totalCars: lotCars,
  //       totalRevenue: lotRevenue,
  //     };
  //   });

  //   return {
  //     ownerId: user.userId,
  //     ownerName: user.fullName ?? 'Owner Account',
  //     from: start.toISOString().split('T')[0],
  //     to: end.toISOString().split('T')[0],
  //     facilityFilter: parkingLotId ?? 'all',
  //     summary: {
  //       ...summary,
  //       totalFacilities: filteredLots.length,
  //       totalBookings,
  //       totalCars,
  //       totalRevenue,
  //       occupancyRate,
  //       peakHour,
  //     },
  //     revenueByDay,
  //     hourlyPoints,
  //     perLotStats,
  //   };
  // }
  // async generateOwnerReportPdf(
  //   user: { userId: string; role: string; fullName?: string },
  //   from?: string,
  //   to?: string,
  //   parkingLotId?: string,
  // ): Promise<{ buffer: Buffer; fileName: string }> {
  //   if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
  //     throw new ForbiddenException('Only owners can download reports');
  //   }

  //   const start = from ? new Date(from) : new Date();
  //   const end = to ? new Date(to) : new Date();

  //   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  //     throw new BadRequestException('Invalid date range');
  //   }

  //   start.setHours(0, 0, 0, 0);
  //   end.setHours(23, 59, 59, 999);

  //   if (end < start) {
  //     throw new BadRequestException(
  //       'Invalid date range: "to" must be after "from"',
  //     );
  //   }

  //   const [summary, bookings, payments, lots] = await Promise.all([
  //     this.repo.getOwnerSummary(user.userId, start, end),
  //     this.repo.getOwnerBookingsInRange(user.userId, start, end),
  //     this.repo.getOwnerSuccessfulPayments(user.userId, start, end),
  //     this.repo.getOwnerParkingLots
  //       ? this.repo.getOwnerParkingLots(user.userId)
  //       : Promise.resolve([] as any[]),
  //   ]);

  //   const filteredBookings = parkingLotId
  //     ? bookings.filter((booking: any) => booking.parkingLotId === parkingLotId)
  //     : bookings;

  //   const filteredPayments = parkingLotId
  //     ? payments.filter((payment: any) => payment.parkingLotId === parkingLotId)
  //     : payments;

  //   const filteredLots = parkingLotId
  //     ? lots.filter((lot: any) => lot.id === parkingLotId)
  //     : lots;

  //   const totalBookings = filteredBookings.length;
  //   const totalCars = filteredBookings.reduce(
  //     (sum: number, booking: any) => sum + (booking.numberOfCars ?? 0),
  //     0,
  //   );
  //   const totalRevenue = filteredPayments.reduce(
  //     (sum: number, payment: any) => sum + (payment.amount ?? 0),
  //     0,
  //   );

  //   const totalCapacity = filteredLots.reduce(
  //     (sum: number, lot: any) => sum + (lot.capacityTotal ?? 0),
  //     0,
  //   );

  //   const occupiedSpots = filteredLots.reduce(
  //     (sum: number, lot: any) => sum + (lot.occupiedSpots ?? 0),
  //     0,
  //   );

  //   const occupancyRate =
  //     totalCapacity > 0 ? Math.round((occupiedSpots / totalCapacity) * 100) : 0;

  //   const hourlyMap = new Map<
  //     number,
  //     { hour: string; bookings: number; cars: number }
  //   >();
  //   for (let h = 0; h < 24; h++) {
  //     hourlyMap.set(h, {
  //       hour: `${String(h).padStart(2, '0')}:00`,
  //       bookings: 0,
  //       cars: 0,
  //     });
  //   }

  //   for (const booking of filteredBookings) {
  //     const hour = new Date(booking.startTime).getHours();
  //     const current = hourlyMap.get(hour);
  //     if (current) {
  //       current.bookings += 1;
  //       current.cars += booking.numberOfCars ?? 0;
  //     }
  //   }

  //   const hourlyPoints = Array.from(hourlyMap.values());
  //   const peakHour =
  //     hourlyPoints.reduce((max, curr) =>
  //       curr.bookings > max.bookings ? curr : max,
  //     ).hour || '--:--';

  //   const revenueByDayMap = new Map<string, number>();
  //   for (const payment of filteredPayments) {
  //     const day = new Date(payment.createdAt).toISOString().split('T')[0];
  //     revenueByDayMap.set(
  //       day,
  //       (revenueByDayMap.get(day) ?? 0) + (payment.amount ?? 0),
  //     );
  //   }

  //   const revenueByDay = Array.from(revenueByDayMap.entries()).map(
  //     ([date, revenue]) => ({
  //       date,
  //       revenue,
  //     }),
  //   );

  //   const perLotStats = filteredLots.map((lot: any) => {
  //     const lotBookings = filteredBookings.filter(
  //       (booking: any) => booking.parkingLotId === lot.id,
  //     );
  //     const lotRevenue = filteredPayments
  //       .filter((payment: any) => payment.parkingLotId === lot.id)
  //       .reduce((sum: number, payment: any) => sum + (payment.amount ?? 0), 0);

  //     const lotCars = lotBookings.reduce(
  //       (sum: number, booking: any) => sum + (booking.numberOfCars ?? 0),
  //       0,
  //     );

  //     return {
  //       name: lot.name,
  //       capacityTotal: lot.capacityTotal ?? 0,
  //       occupiedSpots: lot.occupiedSpots ?? 0,
  //       bookings: lotBookings.length,
  //       cars: lotCars,
  //       revenue: lotRevenue,
  //       isActive: lot.isActive ? 'Active' : 'Inactive',
  //     };
  //   });

  //   const doc = new PDFDocument({
  //     size: 'A4',
  //     margin: 50,
  //   });

  //   const buffers: Buffer[] = [];

  //   doc.on('data', (chunk) => buffers.push(chunk));
  //   const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
  //     doc.on('end', () => resolve(Buffer.concat(buffers)));
  //     doc.on('error', reject);
  //   });

  //   const addTitle = (title: string, subtitle?: string) => {
  //     doc.fontSize(20).fillColor('#111827').text(title, { align: 'left' });

  //     if (subtitle) {
  //       doc.moveDown(0.3).fontSize(10).fillColor('#6B7280').text(subtitle);
  //     }

  //     doc.moveDown(1);
  //   };

  //   const addSectionTitle = (title: string) => {
  //     doc.moveDown(0.5).fontSize(14).fillColor('#111827').text(title);
  //     doc.moveDown(0.5);
  //   };

  //   const addKeyValue = (label: string, value: string) => {
  //     doc
  //       .fontSize(10)
  //       .fillColor('#6B7280')
  //       .text(`${label}: `, { continued: true })
  //       .fillColor('#111827')
  //       .text(value);
  //   };

  //   const addTableRow = (
  //     columns: string[],
  //     widths: number[],
  //     options?: { header?: boolean },
  //   ) => {
  //     const y = doc.y;
  //     let x = doc.page.margins.left;

  //     const rowHeight = 20;

  //     if (options?.header) {
  //       doc
  //         .rect(
  //           x,
  //           y - 2,
  //           widths.reduce((a, b) => a + b, 0),
  //           rowHeight,
  //         )
  //         .fill('#F3F4F6');
  //     }

  //     x = doc.page.margins.left;

  //     columns.forEach((col, index) => {
  //       doc
  //         .fillColor('#111827')
  //         .fontSize(9)
  //         .text(col, x + 4, y + 4, {
  //           width: widths[index] - 8,
  //           align: 'left',
  //         });

  //       x += widths[index];
  //     });

  //     doc.moveDown(1.2);
  //   };

  //   addTitle(
  //     'ParkSmart Owner Performance Report',
  //     `Generated on ${new Date().toLocaleString()}`,
  //   );

  //   addSectionTitle('Report Details');
  //   addKeyValue('Owner ID', user.userId);
  //   addKeyValue('Owner Name', user.fullName ?? 'Owner Account');
  //   addKeyValue(
  //     'Date Range',
  //     `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
  //   );
  //   addKeyValue(
  //     'Facility Filter',
  //     parkingLotId
  //       ? (filteredLots[0]?.name ?? 'Selected Facility')
  //       : 'All Facilities',
  //   );

  //   doc.moveDown();

  //   addSectionTitle('Summary Statistics');
  //   addKeyValue('Total Facilities', String(filteredLots.length));
  //   addKeyValue('Total Bookings', String(totalBookings));
  //   addKeyValue('Total Cars', String(totalCars));
  //   addKeyValue('Total Revenue', `KES ${totalRevenue.toLocaleString()}`);
  //   addKeyValue('Occupancy Rate', `${occupancyRate}%`);
  //   addKeyValue('Peak Hour', peakHour);

  //   doc.moveDown();

  //   addSectionTitle('Revenue By Day');
  //   if (revenueByDay.length === 0) {
  //     doc
  //       .fontSize(10)
  //       .fillColor('#6B7280')
  //       .text('No revenue data available for this range.');
  //   } else {
  //     addTableRow(['Date', 'Revenue (KES)'], [250, 200], { header: true });
  //     revenueByDay.forEach((item) => {
  //       addTableRow([item.date, item.revenue.toLocaleString()], [250, 200]);
  //     });
  //   }

  //   doc.moveDown();

  //   if (doc.y > 650) {
  //     doc.addPage();
  //   }

  //   addSectionTitle('Hourly Booking Activity');
  //   addTableRow(['Hour', 'Bookings', 'Cars'], [150, 150, 150], {
  //     header: true,
  //   });
  //   hourlyPoints.forEach((item) => {
  //     addTableRow(
  //       [item.hour, String(item.bookings), String(item.cars)],
  //       [150, 150, 150],
  //     );
  //   });

  //   doc.moveDown();

  //   if (doc.y > 620) {
  //     doc.addPage();
  //   }

  //   addSectionTitle('Parking Lot Performance');
  //   if (perLotStats.length === 0) {
  //     doc
  //       .fontSize(10)
  //       .fillColor('#6B7280')
  //       .text('No parking lot data available.');
  //   } else {
  //     addTableRow(
  //       ['Lot', 'Status', 'Capacity', 'Bookings', 'Cars', 'Revenue'],
  //       [140, 70, 70, 70, 50, 90],
  //       { header: true },
  //     );

  //     perLotStats.forEach((lot) => {
  //       if (doc.y > 720) {
  //         doc.addPage();
  //         addTableRow(
  //           ['Lot', 'Status', 'Capacity', 'Bookings', 'Cars', 'Revenue'],
  //           [140, 70, 70, 70, 50, 90],
  //           { header: true },
  //         );
  //       }

  //       addTableRow(
  //         [
  //           lot.name,
  //           lot.isActive,
  //           String(lot.capacityTotal),
  //           String(lot.bookings),
  //           String(lot.cars),
  //           `KES ${lot.revenue.toLocaleString()}`,
  //         ],
  //         [140, 70, 70, 70, 50, 90],
  //       );
  //     });
  //   }

  //   doc.moveDown(2);
  //   doc
  //     .fontSize(9)
  //     .fillColor('#9CA3AF')
  //     .text('ParkSmart Analytics Report', { align: 'center' });

  //   doc.end();

  //   const buffer = await pdfBufferPromise;
  //   const fileName = `parksmart-owner-report-${start.toISOString().split('T')[0]
  //     }-to-${end.toISOString().split('T')[0]}.pdf`;

  //   return { buffer, fileName };
  // }
}
