import { prisma } from '../../../database/prisma';

export class DriverDriver {
  async findAll(filters: { status?: string; search?: string }) {
    const { status, search } = filters;
    const where: any = { isActive: true };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.driver.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.driver.findUnique({
      where: { id },
      include: {
        trips: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByLicense(licenseNumber: string) {
    return prisma.driver.findUnique({
      where: { licenseNumber },
    });
  }

  async create(data: any) {
    return prisma.driver.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.driver.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const driverDriver = new DriverDriver();
