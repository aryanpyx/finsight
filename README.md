# FinSight AI - AI-Powered Financial Co-Pilot for MSPs
 ## Overview

FinSight AI is a responsive web application designed as an AI-powered financial co-pilot for Managed Service Providers (MSPs). The application detects revenue leaks such as unbilled work and SLA breaches, while also identifying IT cost waste including unused SaaS licenses. The system provides intelligent analysis of contracts, work logs, and license data to generate actionable insights and professional proposals for cost optimization and revenue recovery.


<img width="1898" height="861" alt="Screenshot 2025-09-21 224445" src="https://github.com/user-attachments/assets/958068fb-9ea3-41db-a1aa-55e662f2e716" />
<img width="1889" height="834" alt="Screenshot 2025-09-21 224457" src="https://github.com/user-attachments/assets/72559c4d-d923-4bde-b46e-02e40e1d8e7b" />
# FinSight AI - AI-Powered Financial Co-Pilot for MSPs

## Overview

FinSight AI is a responsive web application designed as an AI-powered financial co-pilot for Managed Service Providers (MSPs). The application detects revenue leaks such as unbilled work and SLA breaches, while also identifying IT cost waste including unused SaaS licenses. The system provides intelligent analysis of contracts, work logs, and license data to generate actionable insights and professional proposals for cost optimization and revenue recovery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript running on Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing with animated page transitions
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Animations**: Framer Motion for smooth page transitions, hover effects, and interactive animations
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod schema validation for type-safe form processing
- **Charts**: Recharts library for responsive data visualizations and financial dashboards

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **File Processing**: Multer middleware for handling multipart/form-data file uploads with memory storage
- **AI Integration**: OpenAI GPT API for contract analysis, license optimization, and proposal generation
- **Development**: TSX for hot-reloading during development with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for cloud-native database hosting
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **In-Memory Storage**: Fallback storage implementation for development and testing scenarios
- **File Storage**: Memory-based file processing with extracted text content stored in database

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **User Management**: Simple username/password authentication with hashed credentials
- **Security**: Express session middleware with secure cookie configuration

### External Service Integrations
- **AI Services**: OpenAI API for natural language processing and content generation
- **File Processing**: Built-in text extraction for CSV, JSON, and document formats
- **Database Hosting**: Neon serverless PostgreSQL for production database needs
- **Development Tools**: Replit-specific plugins for error handling and development banners

### Key Design Patterns
- **Shared Types**: Common TypeScript schemas between frontend and backend using Zod for validation
- **Component Architecture**: Modular UI components with consistent props and styling patterns
- **Error Handling**: Centralized error management with toast notifications and graceful fallbacks
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints for all screen sizes
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with animations
- **Type Safety**: End-to-end TypeScript with strict compilation and schema validation

## External Dependencies

### Core Technologies
- **React**: Frontend framework with hooks and functional components
- **TypeScript**: Type-safe development across frontend and backend
- **Node.js/Express**: Backend runtime and web framework
- **PostgreSQL**: Primary database with Drizzle ORM
- **Vite**: Build tool and development server

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Framer Motion**: Animation library for smooth transitions and interactions
- **Lucide React**: Icon library for consistent iconography

### Data and API Management
- **TanStack React Query**: Server state management and caching
- **Zod**: Schema validation for type-safe data handling
- **React Hook Form**: Form state management with validation
- **Multer**: File upload handling middleware

### AI and Processing
- **OpenAI API**: GPT models for contract analysis and proposal generation
- **Recharts**: Chart library for financial data visualization

### Development and Deployment
- **TSX**: TypeScript execution for development hot-reloading
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundling for production builds
- **Replit Plugins**: Development environment enhancements

Copyright (c) 2025 Aryan Pandey 
 
 All rights reserved. 
 
 This project and its source code are proprietary and confidential. 
 No permission is granted to use, copy, modify, merge, publish, distribute, 
 or create derivative works from this project in any form, without prior 
 written consent from the author(s).
