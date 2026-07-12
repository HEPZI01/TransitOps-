import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transitops.com' },
    update: {},
    create: {
      email: 'admin@transitops.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  const fmPassword = await hashPassword('fm123');
  const fleetManager = await prisma.user.upsert({
    where: { email: 'fm@transitops.com' },
    update: {},
    create: {
      email: 'fm@transitops.com',
      password: fmPassword,
      name: 'Fleet Manager',
      role: 'FLEET_MANAGER',
    },
  });
  console.log('Created fleet manager:', fleetManager.email);

  const dispatchPassword = await hashPassword('dispatch123');
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@transitops.com' },
    update: {},
    create: {
      email: 'dispatcher@transitops.com',
      password: dispatchPassword,
      name: 'John Dispatcher',
      role: 'DISPATCHER',
    },
  });
  console.log('Created dispatcher:', dispatcher.email);

  const safetyPassword = await hashPassword('safety123');
  const safetyOfficer = await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: {},
    create: {
      email: 'safety@transitops.com',
      password: safetyPassword,
      name: 'Jane Safety Officer',
      role: 'SAFETY_OFFICER',
    },
  });
  console.log('Created safety officer:', safetyOfficer.email);

  const financePassword = await hashPassword('finance123');
  const financialAnalyst = await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: {},
    create: {
      email: 'finance@transitops.com',
      password: financePassword,
      name: 'Finley Financial Analyst',
      role: 'FINANCIAL_ANALYST',
    },
  });
  console.log('Created financial analyst:', financialAnalyst.email);

  const vehicles = [
    { registrationNumber: 'TRK-001', make: 'Volvo', model: 'FH16', year: 2022, type: 'TRUCK', capacity: 20, fuelType: 'Diesel', status: 'AVAILABLE', currentMileage: 45000 },
    { registrationNumber: 'TRK-002', make: 'Scania', model: 'R500', year: 2021, type: 'TRUCK', capacity: 25, fuelType: 'Diesel', status: 'AVAILABLE', currentMileage: 62000 },
    { registrationNumber: 'TRK-003', make: 'MAN', model: 'TGX', year: 2023, type: 'TRUCK', capacity: 18, fuelType: 'Diesel', status: 'ON_TRIP', currentMileage: 28000 },
    { registrationNumber: 'VAN-001', make: 'Mercedes-Benz', model: 'Sprinter', year: 2023, type: 'VAN', capacity: 2.5, fuelType: 'Diesel', status: 'AVAILABLE', currentMileage: 12000 },
    { registrationNumber: 'VAN-002', make: 'Ford', model: 'Transit', year: 2022, type: 'VAN', capacity: 2, fuelType: 'Diesel', status: 'AVAILABLE', currentMileage: 34000 },
    { registrationNumber: 'BUS-001', make: 'Marcopolo', model: 'Torino', year: 2020, type: 'BUS', capacity: 4.5, fuelType: 'Diesel', status: 'IN_SHOP', currentMileage: 120000 },
    { registrationNumber: 'TNK-001', make: 'Isuzu', model: 'FVZ', year: 2019, type: 'TANKER', capacity: 15, fuelType: 'Diesel', status: 'RETIRED', currentMileage: 250000 },
    { registrationNumber: 'FLB-001', make: 'Kenworth', model: 'T680', year: 2021, type: 'FLATBED', capacity: 22, fuelType: 'Diesel', status: 'AVAILABLE', currentMileage: 71000 },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { registrationNumber: vehicle.registrationNumber },
      update: {},
      create: vehicle,
    });
  }
  console.log('Created vehicles');

  const drivers = [
    { name: 'Michael Johnson', licenseNumber: 'DL-001-2024', licenseExpiry: new Date('2027-12-31'), phone: '+1-555-0101', email: 'michael.johnson@transit.com', status: 'AVAILABLE', experience: 8, rating: 4.8 },
    { name: 'Sarah Williams', licenseNumber: 'DL-002-2024', licenseExpiry: new Date('2026-06-30'), phone: '+1-555-0102', email: 'sarah.williams@transit.com', status: 'AVAILABLE', experience: 5, rating: 4.6 },
    { name: 'David Brown', licenseNumber: 'DL-003-2024', licenseExpiry: new Date('2028-03-15'), phone: '+1-555-0103', email: 'david.brown@transit.com', status: 'AVAILABLE', experience: 12, rating: 4.9 },
    { name: 'Emily Davis', licenseNumber: 'DL-004-2024', licenseExpiry: new Date('2026-01-31'), phone: '+1-555-0104', email: 'emily.davis@transit.com', status: 'ON_TRIP', experience: 3, rating: 4.3 },
    { name: 'James Wilson', licenseNumber: 'DL-005-2024', licenseExpiry: new Date('2025-01-31'), phone: '+1-555-0105', email: 'james.wilson@transit.com', status: 'SUSPENDED', experience: 10, rating: 4.1 },
    { name: 'Lisa Anderson', licenseNumber: 'DL-006-2024', licenseExpiry: new Date('2027-08-20'), phone: '+1-555-0106', email: 'lisa.anderson@transit.com', status: 'AVAILABLE', experience: 7, rating: 4.7 },
    { name: 'Robert Martinez', licenseNumber: 'DL-007-2024', licenseExpiry: new Date('2026-11-15'), phone: '+1-555-0107', email: 'robert.martinez@transit.com', status: 'OFF_DUTY', experience: 15, rating: 4.5 },
  ];

  for (const driver of drivers) {
    await prisma.driver.upsert({
      where: { licenseNumber: driver.licenseNumber },
      update: {},
      create: driver,
    });
  }
  console.log('Created drivers');

  const allVehicles = await prisma.vehicle.findMany();
  const allDrivers = await prisma.driver.findMany();

  const truck1 = allVehicles.find(v => v.registrationNumber === 'TRK-003');
  const driver4 = allDrivers.find(d => d.licenseNumber === 'DL-004-2024');

  if (truck1 && driver4) {
    await prisma.trip.create({
      data: {
        vehicleId: truck1.id,
        driverId: driver4.id,
        origin: 'Los Angeles, CA',
        destination: 'Phoenix, AZ',
        departureDate: new Date(),
        status: 'IN_PROGRESS',
        cargoDescription: 'Electronics equipment',
        cargoWeight: 12.5,
        estimatedDistance: 600,
        notes: 'Express delivery - handle with care',
      },
    });
    console.log('Created in-progress trip');
  }

  const truck2 = allVehicles.find(v => v.registrationNumber === 'TRK-001');
  const driver1 = allDrivers.find(d => d.licenseNumber === 'DL-001-2024');

  if (truck2 && driver1) {
    await prisma.trip.create({
      data: {
        vehicleId: truck2.id,
        driverId: driver1.id,
        origin: 'San Francisco, CA',
        destination: 'Seattle, WA',
        departureDate: new Date(Date.now() - 86400000 * 2),
        arrivalDate: new Date(Date.now() - 86400000),
        status: 'COMPLETED',
        cargoDescription: 'Agricultural products',
        cargoWeight: 15,
        estimatedDistance: 1300,
        actualDistance: 1320,
      },
    });
    console.log('Created completed trip');
  }

  const van1 = allVehicles.find(v => v.registrationNumber === 'VAN-001');
  const driver2 = allDrivers.find(d => d.licenseNumber === 'DL-002-2024');

  if (van1 && driver2) {
    await prisma.trip.create({
      data: {
        vehicleId: van1.id,
        driverId: driver2.id,
        origin: 'Denver, CO',
        destination: 'Salt Lake City, UT',
        departureDate: new Date(Date.now() + 86400000),
        status: 'PENDING',
        cargoDescription: 'Medical supplies',
        cargoWeight: 1.2,
        estimatedDistance: 800,
      },
    });
    console.log('Created pending trip');
  }

  if (truck1) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: truck1.id,
        type: 'ROUTINE',
        description: 'Regular 50,000km service - oil change, filter replacement, brake inspection',
        cost: 850,
        scheduledDate: new Date(),
        status: 'IN_PROGRESS',
        mechanicName: 'Mike\'s Auto Shop',
      },
    });
    console.log('Created maintenance log');
  }

  const bus1 = allVehicles.find(v => v.registrationNumber === 'BUS-001');
  if (bus1) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: bus1.id,
        type: 'REPAIR',
        description: 'Engine overhaul - excessive oil consumption and power loss',
        cost: 4500,
        scheduledDate: new Date(Date.now() - 86400000 * 5),
        status: 'IN_PROGRESS',
        mechanicName: 'Heavy Duty Repairs Inc.',
        partsReplaced: 'Piston rings, gaskets, oil seals',
      },
    });
    console.log('Created repair maintenance log');
  }

  if (truck2) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: truck2.id,
        type: 'INSPECTION',
        description: 'Annual safety inspection',
        cost: 200,
        scheduledDate: new Date(Date.now() + 86400000 * 7),
        status: 'SCHEDULED',
        mechanicName: 'City Inspection Center',
      },
    });
    console.log('Created scheduled inspection');
  }

  if (truck2) {
    await prisma.fuelLog.create({
      data: {
        vehicleId: truck2.id,
        date: new Date(Date.now() - 86400000),
        fuelAmount: 180,
        cost: 630,
        mileage: 44800,
        station: 'Shell - I-5 Corridor',
        receiptNumber: 'SH-2024-88721',
      },
    });
    await prisma.fuelLog.create({
      data: {
        vehicleId: truck2.id,
        date: new Date(Date.now() - 86400000 * 3),
        fuelAmount: 200,
        cost: 700,
        mileage: 44500,
        station: 'Chevron - Bay Area',
        receiptNumber: 'CH-2024-33421',
      },
    });
    console.log('Created fuel logs');
  }

  if (truck1) {
    await prisma.fuelLog.create({
      data: {
        vehicleId: truck1.id,
        date: new Date(),
        fuelAmount: 150,
        cost: 525,
        mileage: 27900,
        station: 'Arco - I-10 East',
        receiptNumber: 'AR-2024-55123',
      },
    });
    console.log('Created fuel log for trip');
  }

  const allTrips = await prisma.trip.findMany();
  const completedTrip = allTrips.find(t => t.status === 'COMPLETED');

  if (completedTrip) {
    await prisma.expense.create({
      data: {
        tripId: completedTrip.id,
        category: 'TOLLS',
        amount: 45,
        description: 'Golden Gate Bridge toll',
        date: new Date(Date.now() - 86400000 * 2),
      },
    });
    await prisma.expense.create({
      data: {
        tripId: completedTrip.id,
        category: 'PARKING',
        amount: 25,
        description: 'Rest area parking',
        date: new Date(Date.now() - 86400000),
      },
    });
    console.log('Created trip expenses');
  }

  await prisma.expense.create({
    data: {
      category: 'INSURANCE',
      amount: 2400,
      description: 'Fleet insurance premium - Q1 2024',
      date: new Date(Date.now() - 86400000 * 30),
    },
  });

  await prisma.expense.create({
    data: {
      category: 'FINE',
      amount: 150,
      description: 'Speeding violation - TRK-002',
      date: new Date(Date.now() - 86400000 * 10),
      notes: 'Highway 101, 15mph over limit',
    },
  });

  console.log('Created additional expenses');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
