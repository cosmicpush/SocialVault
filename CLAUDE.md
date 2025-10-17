# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**SocialVault** is a secure Facebook account management web application built with Next.js 14, React 18, and Prisma ORM. The app specializes in encrypted Facebook credential storage with advanced security features. Currently deployed at bharatiyanews.com.

**Key Focus**: This is a streamlined, single-purpose application focused exclusively on Facebook account management with enterprise-grade security.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM with SQLite
- **Security**: CryptoJS AES encryption, custom auth with 2FA, HTTP-only cookie sessions
- **Production**: PM2 process manager, Nginx reverse proxy

## Essential Commands

### Development
```bash
npm run dev              # Start development server on port 3000
npm run build            # Production build
npm run lint             # ESLint code linting
npm run typecheck        # TypeScript type checking
npm run format           # Prettier code formatting
```

### Production Deployment
```bash
npm run prod:setup       # Initial production setup and build
npm run prod:start       # Start with PM2 (port 3000)
npm run prod:reload      # Zero-downtime reload for updates
npm run prod:stop        # Stop PM2 processes
```

### Database Management
```bash
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open database GUI at http://localhost:5555
npm run backup           # Backup SQLite database
npm run restore          # Restore database from backup
npm run check-db         # Database health check and validation
```

### User Management
```bash
node scripts/create-user.js  # Create new user with 2FA setup
npm run debug-user           # Debug user authentication issues
```

### Maintenance
```bash
npm run maintenance:start    # Enable maintenance mode (backup + stop)
npm run maintenance:end      # Disable maintenance mode (build + restart)
```

## Architecture

### Database Models (2 core entities)
- **User**: Authentication, 2FA settings, session management
- **FacebookAccount**: Encrypted FB credentials with 2FA secrets, tags, drag-and-drop ordering

### Key Directories
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication (login, 2FA setup/verify)
│   │   └── facebook-accounts/ # Facebook account CRUD + export
│   ├── facebook-accounts/ # Main UI page
│   ├── login/            # Auth pages
│   └── settings/         # 2FA setup UI
├── components/            # React components
│   ├── FacebookAccountManager.jsx # Main account management interface
│   ├── common/           # ResourceManager (reusable CRUD system)
│   ├── layout/           # Header/Footer
│   └── ui/               # Radix UI components
├── utils/                # Helper functions
│   ├── crypto.js         # AES encryption/decryption utilities
│   ├── 2fa.js           # TOTP implementation
│   └── prisma.js        # Database connection
├── database/             # SQLite database file location
└── scripts/              # Database and user management utilities
```

### Security Implementation
- **Encryption**: ALL sensitive data encrypted with AES (CryptoJS) before database storage
- **Authentication**: Custom middleware with HTTP-only cookie sessions (24h expiration)  
- **2FA**: TOTP implementation with real-time code generation and QR setup
- **Route Protection**: `middleware.ts` protects all authenticated routes
- **Development Mode**: Optional auth bypass via `DEV_MODE_BYPASS_AUTH=true`

### API Structure
- **Authentication**: `/api/auth/[login|setup-2fa|verify-2fa]`
- **Facebook Accounts**: `/api/facebook-accounts` - Full CRUD with encryption/decryption
- **Export**: `/api/facebook-accounts` - PATCH for bulk export, individual account export

All APIs handle encrypted payloads for sensitive data and return encrypted responses.

### Component Architecture

#### FacebookAccountManager.jsx
- Main interface combining drag-and-drop, filtering, and CRUD operations
- Uses ResourceProvider context for state management
- Handles encryption/decryption transparently
- Features:
  - Drag-and-drop reordering with live preview
  - Advanced tag filtering (supports any combination)
  - Real-time TOTP code display with countdown timers
  - Secure copy-to-clipboard functionality
  - Modal-based add/edit forms

#### ResourceManager (components/common/)
- Reusable CRUD system with built-in encryption handling
- Provides context-based state management
- Standardizes UI patterns across features
- Handles loading states, error boundaries, and data validation

## Production Configuration

- **Process Manager**: PM2 with ecosystem.config.js
- **Port**: 3000 (both development and production)
- **Database**: SQLite at `/var/www/bharatiyanews.com/database/dev.db`
- **Reverse Proxy**: Nginx configuration for HTTPS termination
- **Backup Schedule**: Automated daily backups via cron jobs

## Development Notes

### Code Conventions
- **Mixed JS/TS**: Follow existing file conventions (.jsx for components, .js for utilities)
- **Encryption Mandatory**: ALL sensitive data must use `utils/crypto.js` functions
- **Database Operations**: Use Prisma client via `utils/prisma.js`
- **Styling**: TailwindCSS with a neutral, security-focused theme
- **Component Pattern**: Use ResourceManager for consistent CRUD operations

### Security Requirements
- **Never store unencrypted sensitive data** in database or logs
- **Always test encryption/decryption flow** when modifying data handling
- **Use proper error handling** to prevent sensitive data leakage
- **Validate all inputs** and sanitize before processing
- **Follow cookie security best practices** for session management

### Testing Guidelines
- Test all CRUD operations through the UI
- Verify encryption/decryption in browser dev tools
- Test drag-and-drop functionality across different screen sizes
- Validate 2FA setup and code generation
- Ensure all sensitive data is properly encrypted in database

### Common Patterns

#### Adding New Encrypted Fields
1. Update Prisma schema
2. Add encryption/decryption logic in `crypto.js`
3. Update form components and validation
4. Run `npx prisma db push` to update database
5. Test encryption flow thoroughly

#### Modifying FacebookAccountManager
- Keep drag-and-drop experience consistent
- Update filtering logic alongside UI changes
- Ensure encryption logic remains centralized
- Validate copy-to-clipboard interactions

## Additional Notes

- Coordinate database backups before deploying schema changes.
- Document new environment variables in `.env.example`.
- Use PM2 maintenance scripts for zero-downtime deploys.
