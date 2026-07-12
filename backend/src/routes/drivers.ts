import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';
import { driverDriver } from '../drivers/driver.driver';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = { isActive: true };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { licenseNumber: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const drivers = await driverDriver.findAll({ status: status as string, search: search as string });

    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Failed to get drivers' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const driver = await driverDriver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Failed to get driver' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'SAFETY_OFFICER'), [
  body('name').trim().notEmpty(),
  body('licenseNumber').trim().notEmpty(),
  body('licenseExpiry').isISO8601(),
  body('phone').trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('experience').isInt({ min: 0 }),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, licenseNumber, licenseExpiry, phone, email, experience } = req.body;

    const existingDriver = await driverDriver.findByLicense(licenseNumber);

    if (existingDriver) {
      return res.status(400).json({ error: 'License number already exists' });
    }

    const driver = await driverDriver.create({
      name,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      phone,
      email,
      experience,
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'SAFETY_OFFICER'), [
  body('name').optional().trim().notEmpty(),
  body('licenseNumber').optional().trim().notEmpty(),
  body('licenseExpiry').optional().isISO8601(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('experience').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, licenseNumber, licenseExpiry, phone, email, experience, status } = req.body;

    const driver = await driverDriver.findById(id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existing = await driverDriver.findByLicense(licenseNumber);
      if (existing) {
        return res.status(400).json({ error: 'License number already exists' });
      }
    }

    const updatedDriver = await driverDriver.update(id, {
      ...(name && { name }),
      ...(licenseNumber && { licenseNumber }),
      ...(licenseExpiry && { licenseExpiry: new Date(licenseExpiry) }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(experience !== undefined && { experience }),
      ...(status && { status }),
    });

    res.json(updatedDriver);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'SAFETY_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await driverDriver.findById(id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    await driverDriver.softDelete(id);

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

export default router;
