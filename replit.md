# Student Result Management System (SRMS)

## Overview

This is a full-stack Student Result Management System built with React frontend and Express backend. The application provides separate dashboards for students and teachers to manage academic results, with features like GPA calculation, result visualization, and academic record management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Theme**: Light/dark mode support with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development**: Vite for build tooling and development server
- **Authentication**: Simple mock authentication (no real auth implementation)

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: ESBuild for production bundling
- **Development**: Concurrent frontend and backend development with Vite middleware

## Key Components

### Database Schema
- **Students**: ID, name, email, student ID, password
- **Teachers**: ID, name, email, department, password
- **Subjects**: ID, name, code, credits
- **Results**: ID, student ID, subject ID, grade, points, semester, academic year, teacher ID

### Authentication System
- Mock login system with email/password
- Role-based access (student/teacher)
- Session management through localStorage
- Protected routes based on user type

### Student Features
- View semester-wise results in tabular format
- GPA/CGPA calculation and display
- Result filtering by semester
- Transcript download (mock functionality)
- Grade visualization with color-coded badges

### Teacher Features
- Upload new results for students
- View and edit submitted results
- Search and filter results by student/semester
- Result management with edit/delete capabilities

### UI Components
- Responsive design with mobile-first approach
- Comprehensive component library (buttons, forms, tables, dialogs)
- Dark/light theme toggle
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

1. **Authentication Flow**:
   - User selects role (student/teacher) on landing page
   - Credentials validated against database
   - User data stored in localStorage
   - Redirect to appropriate dashboard

2. **Student Dashboard Flow**:
   - Fetch student data with results from API
   - Calculate GPA/CGPA using frontend utilities
   - Display results in filterable table
   - Show semester-wise performance metrics

3. **Teacher Dashboard Flow**:
   - Fetch teacher's submitted results
   - Display result upload form with student/subject dropdowns
   - Handle result CRUD operations
   - Real-time updates through React Query

4. **Data Persistence**:
   - All data stored in PostgreSQL database
   - Drizzle ORM handles database operations
   - API endpoints for CRUD operations
   - Optimistic updates for better UX

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI library (Radix UI primitives, shadcn/ui components)
- Form handling (React Hook Form, Zod validation)
- Styling (Tailwind CSS, class-variance-authority)
- Routing (Wouter)
- Date handling (date-fns)
- Utilities (clsx, cmdk)

### Backend Dependencies
- Database (Drizzle ORM, @neondatabase/serverless)
- Server (Express.js, session management)
- Development (tsx, Vite, ESBuild)
- Validation (Zod, drizzle-zod)

### Development Tools
- TypeScript for type safety
- ESLint and Prettier for code quality
- Vite for fast development and building
- PostCSS for CSS processing

## Deployment Strategy

### Development
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations handled by Drizzle Kit
- Environment variables for database connection

### Production
- Frontend built to static files with Vite
- Backend bundled with ESBuild for Node.js
- Database deployed on Neon (serverless PostgreSQL)
- Single server deployment serving both frontend and API

### Database Management
- Schema defined in shared TypeScript files
- Migrations generated and applied via Drizzle Kit
- Database URL configured through environment variables
- PostgreSQL dialect with connection pooling

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a focus on developer experience and user interface quality.