# Dobbs Tire & Auto Centers AI Service Assistant

## Overview

This is an embeddable AI-powered chat widget for Dobbs Tire & Auto Centers, a family-operated auto service company in St. Louis since 1976. The application provides instant customer service through a conversational interface, answering FAQs about services, locations, hours, and tire brands, while also capturing appointment leads. The system is designed to run entirely on free-tier services (Replit hosting, Groq API for LLM, or fallback FAQ matching) with no paid dependencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety and component-based UI
- Vite as the build tool and development server
- TanStack React Query for server state management and API caching
- Wouter for lightweight client-side routing
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens

**Design System:**
- Brand colors: Primary red (#C8102E), Black (#000000), White (#FFFFFF), Gray accents
- Typography: Inter font family via Google Fonts
- Component variants follow New York style from shadcn/ui
- Responsive design with mobile-first approach (380px × 600px widget on desktop, full-screen on mobile)

**Key Components:**
- `ChatWidget`: Main embeddable chat interface with message display, input field, and voice recording capability
- `AppointmentForm`: Multi-step form for collecting customer appointment details (name, location, service type, preferred date/time)
- UI components from shadcn/ui for consistent design patterns

**State Management:**
- Local component state for chat messages and UI interactions
- React Query for API request caching and error handling
- Toast notifications for user feedback

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for HTTP server
- TypeScript for type safety across the full stack
- Drizzle ORM configured for PostgreSQL (schema defined but database optional)
- Session management with connect-pg-simple (when database available)

**API Design:**
- RESTful endpoints for chat and appointment management
- `/api/chat` - POST endpoint for processing user messages
- `/api/appointments` - POST endpoint for creating appointment leads
- `/api/appointments` - GET endpoint for retrieving all appointments

**AI/LLM Integration Strategy:**
The system uses a tiered fallback approach for generating responses:

1. **Primary: FAQ Database Search** - Fast keyword-based matching against pre-defined questions/answers for common queries (hours, locations, services, tire brands)
2. **Secondary: Groq LLM** - When FAQ doesn't match, uses Groq's free-tier llama-3.1-8b-instant model for natural language understanding
3. **Fallback: Generic Response** - If Groq API is unavailable, returns safe default message

**Business Logic:**
- FAQ matching using keyword search with relevance scoring
- Intent detection for appointment scheduling triggers
- Lead capture with validation using Zod schemas

### Data Storage Solutions

**Current Implementation:**
- In-memory storage with file persistence to `leads/appointments.json`
- Appointments saved as JSON array for simple deployment without database requirements

**Database Schema (Configured but Optional):**
- PostgreSQL with Drizzle ORM
- `users` table: Basic authentication structure (id, username, password)
- `appointments` table: Lead capture (id, name, location, service_type, preferred_date, preferred_time, created_at)
- Connection via Neon serverless driver when DATABASE_URL environment variable is present

**Rationale:**
This dual approach allows the application to run immediately on Replit free tier without requiring database provisioning, while maintaining the option to upgrade to persistent PostgreSQL storage simply by adding a DATABASE_URL environment variable.

### External Dependencies

**Third-Party APIs:**
- **Groq API** (optional): Free-tier LLM service for natural language processing using llama-3.1-8b-instant model
  - Environment variable: `GROQ_API_KEY`
  - Graceful degradation to FAQ-only mode if unavailable

**Database Services:**
- **Neon PostgreSQL** (optional): Serverless PostgreSQL hosting when DATABASE_URL is configured
  - Used with Drizzle ORM for structured data persistence

**UI Component Libraries:**
- **shadcn/ui**: Collection of re-usable components built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives (Dialog, Dropdown, Select, etc.)
- **Lucide React**: Icon library for consistent iconography

**Development Tools:**
- **Replit Plugins**: Development banner, cartographer, and runtime error overlay for enhanced DX
- **Google Fonts**: Inter font family for typography

**Browser APIs:**
- **Web Speech API**: Voice input functionality for chat widget (browser-dependent)

**Key Design Decisions:**
- **Free-tier first**: All core functionality works without paid services
- **Progressive enhancement**: Optional Groq API and database improve experience but aren't required
- **Embeddable architecture**: Widget designed to be embedded into existing Dobbs website
- **Mobile-responsive**: Full-screen on mobile devices for optimal user experience
- **Accessibility**: Built on Radix UI primitives for ARIA compliance and keyboard navigation