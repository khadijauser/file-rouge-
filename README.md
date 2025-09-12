# Appointment Booking System

A clean and simple medical appointment booking system with smart categorization and management.

## Features

### Core Functionality
- **User Authentication**: Login/register with role-based access (patient, doctor, admin)
- **Appointment Booking**: Easy appointment scheduling with validation
- **Smart Categorization**: Automatic sorting into Upcoming, Past, Completed, and Cancelled
- **Role-Based Access**: Different views and permissions for each user role

### Upcoming Appointments
- **Next Appointment Quick View**: Prominent display of upcoming appointments
- **Time Countdown**: Shows time until appointment (e.g., "2 days away")
- **Visual Indicators**: Today's appointments are highlighted
- **Smart Organization**: Chronologically sorted by date and time

## Quick Start

1. **Backend Setup**:
   bash
   cd backend
   npm install
   npm run dev
  

2. **Frontend Setup**:
  bash
   cd frontend
   npm install
   npm run dev
  

3. **Test the System**:
   - Register as a patient
   - Book an appointment
   - View appointments in organized categories

## API Endpoints

- `POST /api/appointments` - Book new appointment
- `GET /api/appointments` - Get all appointments (categorized)
- `GET /api/appointments/upcoming` - Get upcoming appointments only
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

## Code Structure

### Frontend
- **React with Hooks**: Modern functional components
- **Tailwind CSS**: Clean, responsive design
- **Context API**: Simple state management
- **React Router**: Clean navigation

### Backend
- **Express.js**: Simple REST API
- **MongoDB**: Document database
- **JWT Authentication**: Secure user sessions
- **Mongoose**: Clean data modeling

## Key Components

- **BookAppointment**: Simple form with validation
- **MyAppointments**: Smart categorization and management
- **Protected Routes**: Role-based access control
- **Clean API**: Simple, focused endpoints

## What Makes It Clean

- **Single Responsibility**: Each component has one clear purpose
- **Minimal Dependencies**: Only essential packages
- **Clear Naming**: Descriptive function and variable names
- **Consistent Patterns**: Uniform code structure throughout
- **Focused Features**: Core functionality without bloat

## Next Steps

1. Add email notifications
2. Implement calendar integration
3. Add appointment reminders
4. Build mobile app
