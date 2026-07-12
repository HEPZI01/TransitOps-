import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, search } = req.query;

    const where: any = { isActive: true };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { registrationNumber: { contains: search as string, mode: 'insensitive' } },
        { make: { contains: search as string, mode: 'insensitive' } },
        { model: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        trips: {
          orderBy: { departureDate: 'desc' },
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        trips: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          take: 5,
        },
        maintenanceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Failed to get vehicle' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), [
  body('registrationNumber').trim().notEmpty(),
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 1900, max: 2030 }),
  body('type').isIn(['TRUCK', 'VAN', 'BUS', 'TRAILER', 'TANKER', 'FLATBED']),
  body('capacity').isFloat({ min: 0 }),
  body('fuelType').trim().notEmpty(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { registrationNumber, make, model, year, type, capacity, fuelType, insuranceExpiry } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber },
    });

    if (existingVehicle) {
      return res.status(400).json({ error: 'Registration number already exists' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        make,
        model,
        year,
        type,
        capacity,
        fuelType,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), [
  body('registrationNumber').optional().trim().notEmpty(),
  body('make').optional().trim().notEmpty(),
  body('model').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1900, max: 2030 }),
  body('type').optional().isIn(['TRUCK', 'VAN', 'BUS', 'TRAILER', 'TANKER', 'FLATBED']),
  body('capacity').optional().isFloat({ min: 0 }),
  body('fuelType').optional().trim().notEmpty(),
  body('status').optional().isIn(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { registrationNumber, make, model, year, type, capacity, fuelType, status, insuranceExpiry } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
      const existing = await prisma.vehicle.findUnique({ where: { registrationNumber } });
      if (existing) {
        return res.status(400).json({ error: 'Registration number already exists' });
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(registrationNumber && { registrationNumber }),
        ...(make && { make }),
        ...(model && { model }),
        ...(year && { year }),
        ...(type && { type }),
        ...(capacity && { capacity }),
        ...(fuelType && { fuelType }),
        ...(status && { status }),
        ...(insuranceExpiry !== undefined && { insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null }),
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.vehicle.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
