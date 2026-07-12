import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    const where: any = {};

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const logs = await prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, registrationNumber: true, make: true, model: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    console.error('Get fuel logs error:', error);
    res.status(500).json({ error: 'Failed to get fuel logs' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const log = await prisma.fuelLog.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });

    if (!log) {
      return res.status(404).json({ error: 'Fuel log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Get fuel log error:', error);
    res.status(500).json({ error: 'Failed to get fuel log' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'), [
  body('vehicleId').trim().notEmpty(),
  body('date').isISO8601(),
  body('fuelAmount').isFloat({ min: 0 }),
  body('cost').isFloat({ min: 0 }),
  body('mileage').isFloat({ min: 0 }),
  body('station').optional().trim(),
  body('receiptNumber').optional().trim(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { vehicleId, date, fuelAmount, cost, mileage, station, receiptNumber } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        date: new Date(date),
        fuelAmount,
        cost,
        mileage,
        station,
        receiptNumber,
      },
    });

    // Update vehicle mileage
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { currentMileage: mileage },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create fuel log error:', error);
    res.status(500).json({ error: 'Failed to create fuel log' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), [
  body('fuelAmount').optional().isFloat({ min: 0 }),
  body('cost').optional().isFloat({ min: 0 }),
  body('mileage').optional().isFloat({ min: 0 }),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { fuelAmount, cost, mileage } = req.body;

    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ error: 'Fuel log not found' });
    }

    const updatedLog = await prisma.fuelLog.update({
      where: { id },
      data: {
        ...(fuelAmount !== undefined && { fuelAmount }),
        ...(cost !== undefined && { cost }),
        ...(mileage !== undefined && { mileage }),
      },
    });

    res.json(updatedLog);
  } catch (error) {
    console.error('Update fuel log error:', error);
    res.status(500).json({ error: 'Failed to update fuel log' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ error: 'Fuel log not found' });
    }

    await prisma.fuelLog.delete({ where: { id } });

    res.json({ message: 'Fuel log deleted successfully' });
  } catch (error) {
    console.error('Delete fuel log error:', error);
    res.status(500).json({ error: 'Failed to delete fuel log' });
  }
});

export default router;
