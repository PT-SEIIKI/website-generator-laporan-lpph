# Visual Inspection Report Builder

## Overview

This is a Visual Inspection Report Builder application designed for creating and generating single-page SLO (Surat Laik Operasi) electrical installation inspection reports. The application functions as a "Layout Builder + Preview" tool where users can:

- Upload company letterhead/logo images
- Upload signature images
- Upload field photos
- Configure flexible grid-based layouts for the report
- Preview the report in A4 format with print-ready output
- Export reports to PDF or Word documents

The identity data table at the top of reports is intentionally left blank for manual filling after printing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful API with typed routes defined in shared/routes.ts
- **File Uploads**: Multer middleware storing files to local `uploads/` directory
- **Document Generation**: docx library for Word document export

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (output to /migrations)
- **Type Safety**: Zod schemas generated from Drizzle schemas via drizzle-zod

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route-level page components
    hooks/        # Custom React hooks for data fetching
    lib/          # Utility functions and query client setup
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database access layer
  db.ts           # Database connection setup
shared/           # Shared code between client and server
  schema.ts       # Drizzle database schema
  routes.ts       # API route type definitions
```

### Key Design Patterns
- **Type-safe API contracts**: Route definitions in shared/routes.ts include method, path, input validation, and response schemas
- **Repository pattern**: DatabaseStorage class in storage.ts abstracts database operations
- **Component composition**: Report builder uses composable sections (Header, Footer, Grid, IdentityTable)
- **A4 page formatting**: CSS-based A4 sizing (210mm x 297mm) with print-specific styles

### Report Layout System
Reports use a flexible JSON-based layout stored in the `layoutJson` column:
- Supports grid sections with configurable columns (1, 2, or 3 columns)
- Supports table sections with editable rows
- Each cell can be an image with caption or a spacer
- Layout changes persist to database automatically

## External Dependencies

### Database
- **PostgreSQL**: Primary database requiring `DATABASE_URL` environment variable
- **Connection**: pg Pool with Drizzle ORM adapter

### File Storage
- **Local Storage**: Uploaded files stored in `/uploads` directory
- **Static Serving**: Express serves uploads at `/uploads` path
- **Size Limit**: 5MB per file upload

### Document Export
- **docx**: Server-side Word document generation for report export
- **Browser Print**: Client-side PDF export via browser print dialog

### UI/Design System
- **Google Fonts**: Inter (primary), JetBrains Mono (code), Outfit (display)
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server with HMR
- **esbuild**: Production bundling for server code
- **TypeScript**: Full type coverage across client/server/shared