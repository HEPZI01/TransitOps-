# Transport Operations Management System - Implementation Plan

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt + RBAC |
| Charts | Recharts |
| PDF Export | jsPDF + html2canvas |
| State | React Query (TanStack Query) |
| Forms | React Hook Form + Zod |
| Date | date-fns |

## Project Structure

```
Transit/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   ├── types/            # TypeScript types
│   │   └── api/              # API client functions
│   └── package.json
├── backend/                  # Express backend
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Auth, validation, RBAC
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helpers
│   │   └── types/            # TypeScript types
│   └── package.json
└── .gitignore
```

## Database Schema

### Tables

1. **users** - Authentication accounts
2. **roles** - User roles (admin, fleet_manager, dispatcher, safety_officer, financial_analyst)
3. **vehicles** - Fleet vehicles
4. **drivers** - Driver profiles
5. **trips** - Trip dispatch records
6. **maintenance_logs** - Vehicle maintenance records
7. **fuel_logs** - Fuel transaction records
8. **expenses** - Operational expenses

### Key Relationships
- users → roles (many-to-one)
- vehicles → trips (one-to-many)
- drivers → trips (one-to-many)
- vehicles → maintenance_logs (one-to-many)
- vehicles → fuel_logs (one-to-many)
- trips → expenses (one-to-many)

## API Routes

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Vehicles
- GET /api/vehicles
- GET /api/vehicles/:id
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id

### Drivers
- GET /api/drivers
- GET /api/drivers/:id
- POST /api/drivers
- PUT /api/drivers/:id
- DELETE /api/drivers/:id

### Trips
- GET /api/trips
- GET /api/trips/:id
- POST /api/trips (dispatch)
- PUT /api/trips/:id (update status)
- DELETE /api/trips/:id

### Maintenance
- GET /api/maintenance
- POST /api/maintenance
- PUT /api/maintenance/:id
- DELETE /api/maintenance/:id

### Fuel Logs
- GET /api/fuel-logs
- POST /api/fuel-logs
- PUT /api/fuel-logs/:id
- DELETE /api/fuel-logs/:id

### Expenses
- GET /api/expenses
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id

### Reports
- GET /api/reports/dashboard
- GET /api/reports/fleet-utilization
- GET /api/reports/cost-analysis
- GET /api/reports/driver-performance
- GET /api/reports/export/:type

## Business Rules (Validation Logic)

1. Vehicle registration number must be unique
2. Vehicles that are Retired or In Shop cannot be dispatched
3. Drivers with expired licenses or suspended status cannot be assigned
4. A vehicle or driver already on a trip cannot be assigned again
5. Cargo cannot exceed vehicle capacity
6. Dispatch automatically changes vehicle and driver status to "On Trip"
7. Completing or cancelling a trip restores them to "Available"
8. Maintenance automatically moves a vehicle to "In Shop"

## Frontend Pages

1. **Login/Register** - Authentication
2. **Dashboard** - KPIs, charts, filters
3. **Vehicles** - List, add, edit, delete
4. **Drivers** - List, add, edit, delete
5. **Trips** - List, dispatch, update status, cancel
6. **Maintenance** - List, add, update, complete
7. **Fuel & Expenses** - List, add, edit, delete
8. **Reports** - Analytics, charts, export

## Implementation Timeline (8 Hours)

### Hour 1-2: Project Setup & Database
- Initialize frontend (React + Vite)
- Initialize backend (Express + TypeScript)
- Set up Prisma with PostgreSQL schema
- Create database migrations
- Set up authentication middleware

### Hour 3-4: Backend API
- Implement auth routes (register, login, me)
- Implement vehicle CRUD with validation
- Implement driver CRUD with validation
- Implement trip management with business rules

### Hour 5-6: Frontend Core
- Set up Tailwind CSS + shadcn/ui
- Create layout components (sidebar, header)
- Build login/register pages
- Build dashboard with KPIs
- Build vehicle and driver management pages

### Hour 7-8: Features & Polish
- Build trip dispatch page
- Build maintenance page
- Build fuel & expense tracking
- Build reports page with charts
- Add dark mode support
- Final testing and bug fixes

## Priority Features

### Must Have (MVP)
- [ ] Authentication with RBAC
- [ ] Vehicle CRUD
- [ ] Driver CRUD
- [ ] Trip management with validations
- [ ] Automatic status transitions
- [ ] Dashboard with KPIs
- [ ] Responsive design

### Should Have
- [ ] Maintenance workflow
- [ ] Fuel & expense tracking
- [ ] Reports with charts
- [ ] Search, filtering & sorting

### Nice to Have (Bonus)
- [ ] PDF export
- [ ] Dark mode
- [ ] Email reminders for expiring licenses
- [ ] Vehicle document management
