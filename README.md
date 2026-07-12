# TransitOps - Smart Transport Operations Platform

## Overview

TransitOps is a web-based Transport Operations Management System designed to digitize fleet operations for logistics organizations. The platform centralizes vehicle management, driver management, trip dispatching, maintenance tracking, fuel logging, expense management, and operational analytics into a single application.

The project was developed as a hackathon solution to address common operational challenges such as scheduling conflicts, underutilized vehicles, missed maintenance, expired driver licenses, inaccurate expense tracking, and limited operational visibility.

---

# Problem Statement

Many transport companies continue to rely on spreadsheets and manual records for managing their fleet operations. This approach often results in:

* Scheduling conflicts
* Duplicate vehicle assignments
* Driver compliance issues
* Missed maintenance schedules
* Poor fuel and expense tracking
* Limited operational insights

TransitOps provides a centralized platform that automates transport operations while enforcing business rules and improving operational efficiency.

---

# Objectives

* Digitize transport operations
* Improve fleet utilization
* Manage vehicles and drivers efficiently
* Automate trip dispatching
* Track maintenance schedules
* Monitor fuel consumption and operational expenses
* Generate reports and analytics
* Enforce business validations automatically

---

# Technology Stack

| Component        | Technology                |
| ---------------- | ------------------------- |
| Frontend         | React + Vite + TypeScript |
| UI               | Tailwind CSS + shadcn/ui  |
| Backend          | Express.js + TypeScript   |
| Database         | PostgreSQL + Prisma ORM   |
| Authentication   | JWT, bcrypt, RBAC         |
| State Management | TanStack Query            |
| Forms            | React Hook Form + Zod     |
| Charts           | Recharts                  |
| PDF Export       | jsPDF + html2canvas       |
| Date Handling    | date-fns                  |

---

# System Features

## Authentication

* Secure user registration and login
* JWT-based authentication
* Role-Based Access Control (RBAC)

## Dashboard

* Fleet utilization overview
* Active vehicles
* Available vehicles
* Vehicles under maintenance
* Active trips
* Pending trips
* Drivers on duty
* Operational KPIs
* Interactive charts

## Vehicle Management

* Register vehicles
* Update vehicle information
* Vehicle status management
* Vehicle search and filtering
* Vehicle lifecycle tracking

## Driver Management

* Driver profile management
* License validation
* Safety score tracking
* Driver availability monitoring

## Trip Management

* Trip creation
* Vehicle assignment
* Driver assignment
* Trip dispatch
* Trip completion
* Trip cancellation

## Maintenance Management

* Maintenance scheduling
* Maintenance history
* Automatic vehicle status updates

## Fuel & Expense Management

* Fuel logging
* Maintenance expenses
* Toll expenses
* Operational cost tracking

## Reports & Analytics

* Fleet utilization
* Fuel efficiency
* Operational cost analysis
* Driver performance
* Vehicle ROI
* CSV/PDF export

---

# User Roles

### Fleet Manager

* Manage fleet assets
* Vehicle lifecycle management
* Maintenance management
* Dashboard monitoring

### Dispatcher

* Create trips
* Assign drivers
* Assign vehicles
* Monitor active trips

### Safety Officer

* Monitor driver compliance
* Verify license validity
* Track safety scores

### Financial Analyst

* Review operational expenses
* Analyze fuel consumption
* Monitor maintenance costs
* Generate profitability reports

---

# Database Design

The system consists of the following primary entities:

* Roles
* Users
* Vehicles
* Drivers
* Trips
* Maintenance Logs
* Fuel Logs
* Expenses

### Entity Relationships

* One Role can have many Users.
* One Vehicle can have many Trips.
* One Driver can have many Trips.
* One Vehicle can have many Maintenance Logs.
* One Vehicle can have many Fuel Logs.
* One Trip can have many Expenses.

---

# Business Rules

The application enforces the following validations:

* Vehicle registration number must be unique.
* Driver license number must be unique.
* Retired vehicles cannot be dispatched.
* Vehicles under maintenance cannot be assigned to trips.
* Drivers with expired licenses cannot be assigned.
* Suspended drivers cannot be assigned.
* A vehicle already on a trip cannot be assigned to another trip.
* A driver already on a trip cannot be assigned to another trip.
* Cargo weight cannot exceed the vehicle's maximum load capacity.
* Dispatching a trip automatically changes the vehicle and driver status to **On Trip**.
* Completing or cancelling a trip restores both statuses to **Available**.
* Creating a maintenance record automatically changes the vehicle status to **In Shop**.

---

# REST API Modules

## Authentication

* Register
* Login
* Logout
* Current User

## Vehicle Management

* Create Vehicle
* View Vehicles
* Update Vehicle
* Delete Vehicle

## Driver Management

* Create Driver
* View Drivers
* Update Driver
* Delete Driver

## Trip Management

* Create Trip
* Dispatch Trip
* Update Trip Status
* Complete Trip
* Cancel Trip

## Maintenance

* Create Maintenance Record
* Update Maintenance
* Complete Maintenance
* Delete Maintenance

## Fuel Logs

* Create Fuel Log
* Update Fuel Log
* Delete Fuel Log

## Expenses

* Create Expense
* Update Expense
* Delete Expense

## Reports

* Dashboard
* Fleet Utilization
* Cost Analysis
* Driver Performance
* Report Export

---

# Project Structure

```text
Transit/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
│
└── README.md
```

---

# Implementation Plan

The project is structured for rapid development within an eight-hour hackathon.

### Phase 1

* Project setup
* Database design
* Authentication
* Database migrations

### Phase 2

* Backend API development
* Vehicle module
* Driver module
* Trip module

### Phase 3

* Frontend development
* Dashboard
* CRUD interfaces
* Responsive layout

### Phase 4

* Maintenance module
* Fuel and expense tracking
* Reports and analytics
* Testing and deployment

---

# Minimum Viable Product

The hackathon submission includes:

* Authentication with RBAC
* Vehicle Management
* Driver Management
* Trip Management
* Business Rule Validation
* Dashboard
* Responsive User Interface

---

# Future Enhancements

* Email notifications for expiring licenses
* Vehicle document management
* GPS tracking integration
* Mobile application
* Predictive maintenance
* Advanced analytics
* Dark mode
* Real-time notifications

---

# Team Responsibilities

| Module         | Responsibility        |
| -------------- | --------------------- |
| Authentication | Login, RBAC           |
| Users          | User Management       |
| Vehicles       | Fleet Management      |
| Drivers        | Driver Management     |
| Trips          | Dispatch & Workflow   |
| Maintenance    | Maintenance Tracking  |
| Fuel Logs      | Fuel Management       |
| Expenses       | Expense Tracking      |
| Reports        | Analytics & Dashboard |

---

# Conclusion

TransitOps provides a centralized and scalable solution for transport operations management. By integrating fleet management, driver management, dispatching, maintenance, fuel tracking, expense monitoring, and reporting into a single platform, the system improves operational efficiency, enhances compliance, and enables data-driven decision-making.

This project was designed as a hackathon solution with a focus on clean architecture, modular development, business rule enforcement, and future scalability.
