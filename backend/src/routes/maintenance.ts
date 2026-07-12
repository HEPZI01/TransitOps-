import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, vehicleId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const logs = await prisma.maintenanceLog.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, registrationNumber: true, make: true, model: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    res.status(500).json({ error: 'Failed to get maintenance logs' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Get maintenance log error:', error);
    res.status(500).json({ error: 'Failed to get maintenance log' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), [
  body('vehicleId').trim().notEmpty(),
  body('type').isIn(['ROUTINE', 'REPAIR', 'EMERGENCY', 'INSPECTION']),
  body('description').trim().notEmpty(),
  body('cost').isFloat({ min: 0 }),
  body('scheduledDate').isISO8601(),
  body('mechanicName').optional().trim(),
  body('partsReplaced').optional().trim(),
  body('notes').optional().trim(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { vehicleId, type, description, cost, scheduledDate, mechanicName, partsReplaced, notes } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const log = await prisma.$transaction(async (tx) => {
      const newLog = await tx.maintenanceLog.create({
        data: {
          vehicleId,
          type,
          description,
          cost,
          scheduledDate: new Date(scheduledDate),
          mechanicName,
          partsReplaced,
          notes,
        },
      });

      // Automatically move vehicle to IN_SHOP
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'IN_SHOP' },
      });

      return newLog;
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create maintenance log error:', error);
    res.status(500).json({ error: 'Failed to create maintenance log' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), [
  body('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('completedDate').optional().isISO8601(),
  body('cost').optional().isFloat({ min: 0 }),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status, completedDate, cost } = req.body;

    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    const updatedLog = await prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceLog.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(completedDate && { completedDate: new Date(completedDate) }),
          ...(cost !== undefined && { cost }),
        },
      });

      // If maintenance is completed, restore vehicle to AVAILABLE
      if (status === 'COMPLETED') {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'AVAILABLE', lastServiceDate: new Date() },
        });
      }

      return updated;
    });

    res.json(updatedLog);
  } catch (error) {
    console.error('Update maintenance log error:', error);
    res.status(500).json({ error: 'Failed to update maintenance log' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'FLEET_MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    await prisma.maintenanceLog.delete({ where: { id } });

    res.json({ message: 'Maintenance log deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance log error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance log' });
  }
});

export default router;
