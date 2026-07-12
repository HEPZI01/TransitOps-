import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../types';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category, tripId, startDate, endDate } = req.query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (tripId) {
      where.tripId = tripId;
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

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        trip: {
          select: { id: true, origin: true, destination: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: { trip: true },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to get expense' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'DISPATCHER', 'FINANCIAL_ANALYST'), [
  body('category').isIn(['FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLLS', 'PARKING', 'FINE', 'OTHER']),
  body('amount').isFloat({ min: 0 }),
  body('description').trim().notEmpty(),
  body('date').isISO8601(),
  body('tripId').optional().trim(),
  body('receiptNumber').optional().trim(),
  body('notes').optional().trim(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { category, amount, description, date, tripId, receiptNumber, notes } = req.body;

    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        amount,
        description,
        date: new Date(date),
        tripId,
        receiptNumber,
        notes,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'FINANCIAL_ANALYST'), [
  body('category').optional().isIn(['FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLLS', 'PARKING', 'FINE', 'OTHER']),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { category, amount, description } = req.body;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(amount !== undefined && { amount }),
        ...(description && { description }),
      },
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'FINANCIAL_ANALYST'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({ where: { id } });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
