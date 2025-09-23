# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
This project uses pnpm as the package manager (pnpm-lock.yaml present).

```bash
# Install dependencies
pnpm install

# Add new dependencies
pnpm add <package-name>

# Add dev dependencies
pnpm add -D <package-name>
```

### Development
```bash
# Run development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.3 with App Router and Turbopack
- **React**: 19.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with jsonwebtoken and bcryptjs
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode enabled

### Project Structure

#### Core Application Routes
- `/` - Public home page
- `/midnight-whisper` - Main whisper/post interface
- `/admin` - Protected admin panel (requires authentication)
- `/login` - Authentication page
- `/setup` - Initial setup page

#### API Routes Structure
All API routes are in `app/api/`:
- `auth/` - Authentication endpoints (login, logout, check, session, setup)
- `posts/` - CRUD operations for posts/whispers
- `settings/` - Application settings management

### Authentication System
- JWT tokens stored in `midnight-auth` httpOnly cookie
- Token expiry: 7 days
- Middleware protection on `/admin` routes (`middleware.ts`)
- Auth utilities in `lib/auth.ts` handle token generation, verification, and cookie management

### Database Architecture
- MongoDB connection managed through `lib/mongodb.ts` with connection caching
- Mongoose models in `models/`:
  - `User.ts` - User authentication with bcrypt password hashing
  - `Post.ts` - Whisper/post entries with content, date, icon, and color
  - `Settings.ts` - Application-wide settings

### Environment Configuration
Required environment variables in `.env.local`:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - JWT secret key (defaults to development key if not set)

### Key Implementation Details
- Path aliases configured: `@/*` maps to root directory
- Turbopack enabled for faster development builds
- Mongoose connection pooling for optimal database performance
- Password hashing uses bcryptjs with salt rounds of 10
- Posts support customizable icons and colors defined in `lib/whispers.ts`