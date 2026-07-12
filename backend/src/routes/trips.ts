import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, vehicleId, driverId, search } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (search) {
      where.OR = [
        { origin: { contains: search as string, mode: 'insensitive' } },
        { destination: { contains: search as string, mode: 'insensitive' } },
        { cargoDescription: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, registrationNumber: true, make: true, model: true },
        },
        driver: {
          select: { id: true, name: true, licenseNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to get trips' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        vehicle: true,
        driver: true,
        expenses: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to get trip' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'), [
  body('vehicleId').trim().notEmpty(),
  body('driverId').trim().notEmpty(),
  body('origin').trim().notEmpty(),
  body('destination').trim().notEmpty(),
  body('departureDate').isISO8601(),
  body('cargoDescription').optional().trim(),
  body('cargoWeight').optional().isFloat({ min: 0 }),
  body('estimatedDistance').optional().isFloat({ min: 0 }),
  body('notes').optional().trim(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { vehicleId, driverId, origin, destination, departureDate, cargoDescription, cargoWeight, estimatedDistance, notes } = req.body;

    // Check vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Vehicle is not available (current status: ${vehicle.status})` });
    }

    // Check cargo doesn't exceed vehicle capacity
    if (cargoWeight && cargoWeight > vehicle.capacity) {
      return res.status(400).json({ error: `Cargo weight (${cargoWeight}t) exceeds vehicle capacity (${vehicle.capacity}t)` });
    }

    // Check driver exists and is available
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (driver.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Driver is not available (current status: ${driver.status})` });
    }

    // Check driver license is not expired
    if (new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({ error: 'Driver license has expired' });
    }

    // Create trip and update statuses in a transaction
    const trip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          vehicleId,
          driverId,
          origin,
          destination,
          departureDate: new Date(departureDate),
          cargoDescription,
          cargoWeight,
          estimatedDistance,
          notes,
        },
      });

      // Update vehicle status to ON_TRIP
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'ON_TRIP' },
      });

      // Update driver status to ON_TRIP
      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'ON_TRIP' },
      });

      return newTrip;
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'), [
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('actualDistance').optional().isFloat({ min: 0 }),
  body('arrivalDate').optional().isISO8601(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status, actualDistance, arrivalDate } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const updated = await tx.trip.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(actualDistance !== undefined && { actualDistance }),
          ...(arrivalDate && { arrivalDate: new Date(arrivalDate) }),
        },
      });

      // If trip is completed or cancelled, restore vehicle and driver status
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: 'AVAILABLE' },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updated;
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status === 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Cannot delete a trip in progress' });
    }

    // If trip is pending, restore vehicle and driver status
    if (trip.status === 'PENDING') {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      });

      await prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    await prisma.trip.delete({ where: { id } });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

export default router;
