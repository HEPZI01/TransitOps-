import { Router, Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalVehicles,
      vehiclesByStatus,
      totalDrivers,
      driversByStatus,
      totalTrips,
      tripsByStatus,
      recentTrips,
      totalExpenses,
      expensesByCategory,
      fuelStats,
      maintenanceStats,
    ] = await Promise.all([
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.vehicle.groupBy({
        by: ['status'],
        _count: true,
        where: { isActive: true },
      }),
      prisma.driver.count({ where: { isActive: true } }),
      prisma.driver.groupBy({
        by: ['status'],
        _count: true,
        where: { isActive: true },
      }),
      prisma.trip.count(),
      prisma.trip.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { registrationNumber: true } },
          driver: { select: { name: true } },
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: true,
      }),
      prisma.fuelLog.aggregate({
        _sum: { fuelAmount: true, cost: true },
      }),
      prisma.maintenanceLog.aggregate({
        _sum: { cost: true },
        _count: true,
        where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      }),
    ]);

    res.json({
      vehicles: {
        total: totalVehicles,
        byStatus: vehiclesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      drivers: {
        total: totalDrivers,
        byStatus: driversByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      trips: {
        total: totalTrips,
        byStatus: tripsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        recent: recentTrips,
      },
      expenses: {
        total: totalExpenses._sum.amount || 0,
        byCategory: expensesByCategory.map(item => ({
          category: item.category,
          total: item._sum.amount || 0,
          count: item._count,
        })),
      },
      fuel: {
        totalLiters: fuelStats._sum.fuelAmount || 0,
        totalCost: fuelStats._sum.cost || 0,
      },
      maintenance: {
        pendingCount: maintenanceStats._count,
        pendingCost: maintenanceStats._sum.cost || 0,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

router.get('/fleet-utilization', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      include: {
        trips: {
          select: { id: true, status: true, departureDate: true, arrivalDate: true },
        },
      },
    });

    const utilization = vehicles.map(vehicle => {
      const totalTrips = vehicle.trips.length;
      const completedTrips = vehicle.trips.filter(t => t.status === 'COMPLETED').length;
      const utilizationRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

      return {
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        model: vehicle.model,
        status: vehicle.status,
        totalTrips,
        completedTrips,
        utilizationRate: Math.round(utilizationRate),
      };
    });

    res.json(utilization);
  } catch (error) {
    console.error('Get fleet utilization error:', error);
    res.status(500).json({ error: 'Failed to get fleet utilization' });
  }
});

router.get('/cost-analysis', authenticate, authorize('ADMIN', 'FINANCIAL_ANALYST'), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const [expenses, fuelLogs, maintenanceLogs] = await Promise.all([
      prisma.expense.findMany({
        where: Object.keys(dateFilter).length ? { date: dateFilter } : {},
      }),
      prisma.fuelLog.findMany({
        where: Object.keys(dateFilter).length ? { date: dateFilter } : {},
      }),
      prisma.maintenanceLog.findMany({
        where: Object.keys(dateFilter).length ? { scheduledDate: dateFilter } : {},
      }),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalFuel = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenance = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

    const expensesByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyExpenses = expenses.reduce((acc, e) => {
      const month = new Date(e.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      summary: {
        totalExpenses,
        totalFuel,
        totalMaintenance,
        totalCost: totalExpenses + totalFuel + totalMaintenance,
      },
      byCategory: expensesByCategory,
      monthly: monthlyExpenses,
    });
  } catch (error) {
    console.error('Get cost analysis error:', error);
    res.status(500).json({ error: 'Failed to get cost analysis' });
  }
});

router.get('/driver-performance', authenticate, authorize('ADMIN', 'SAFETY_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        trips: {
          select: { id: true, status: true, actualDistance: true, cargoWeight: true },
        },
      },
    });

    const performance = drivers.map(driver => {
      const totalTrips = driver.trips.length;
      const completedTrips = driver.trips.filter(t => t.status === 'COMPLETED').length;
      const totalDistance = driver.trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
      const totalCargo = driver.trips.reduce((sum, t) => sum + (t.cargoWeight || 0), 0);
      const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

      return {
        id: driver.id,
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        status: driver.status,
        rating: driver.rating,
        totalTrips,
        completedTrips,
        completionRate: Math.round(completionRate),
        totalDistance: Math.round(totalDistance),
        totalCargo: Math.round(totalCargo),
      };
    });

    res.json(performance);
  } catch (error) {
    console.error('Get driver performance error:', error);
    res.status(500).json({ error: 'Failed to get driver performance' });
  }
});

export default router;
