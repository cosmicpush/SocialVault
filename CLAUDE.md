# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SocialVault** is a secure Facebook account management web application built with Next.js 14, React 18, and Prisma ORM. The app specializes in encrypted Facebook credential storage with advanced security features. Currently deployed at bharatiyanews.com.

**Key Focus**: This is a streamlined, single-purpose application focused exclusively on Facebook account management with enterprise-grade security.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM with SQLite
- **Security**: CryptoJS AES encryption, custom auth with 2FA, HTTP-only cookie sessions, Google ReCAPTCHA v2
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

### Database Models (3 core entities)
- **User**: Authentication, 2FA settings, session management
- **FacebookAccount**: Encrypted FB credentials with 2FA secrets, tags, drag-and-drop ordering, optional group assignment
- **FacebookGroup**: Organizational grouping for accounts with custom ordering

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
  - Uses versioned encryption format (`v1:` prefix) for future compatibility
  - Encryption key from `ENCRYPTION_KEY` or `NEXT_PUBLIC_ENCRYPTION_KEY` env var
  - Specialized functions for Facebook account encryption/decryption in `utils/crypto.js`
- **Authentication**: Custom middleware with HTTP-only cookie sessions (24h expiration)
  - Session tokens: `session-token` and `authenticated` cookies
  - Middleware excludes: `/api/auth/*`, `/_next/*`, `/login`, `/favicon.ico`
- **2FA**: TOTP implementation (OTPLib) with real-time code generation and QR setup
- **Route Protection**: `middleware.ts` protects all authenticated routes
- **Development Mode**: Optional auth bypass via `BYPASS_AUTH=true` (only works in NODE_ENV=development)
- **ReCAPTCHA**: Google ReCAPTCHA v2 integration for bot protection
- **IP Whitelisting**: Optional IPv6 whitelist support via `WHITELISTED_IPV6` env var

### API Structure
- **Authentication**: `/api/auth/[login|setup-2fa|verify-2fa]`
- **Facebook Accounts**: `/api/facebook-accounts` - Full CRUD with encryption/decryption
  - GET: Fetch all accounts (decrypted)
  - POST: Create new account (encrypts before storage)
  - PUT: Update account (encrypts before storage)
  - DELETE: Delete account by ID
  - PATCH: Bulk export all accounts in text format
- **Facebook Groups**: `/api/facebook-groups` - CRUD for account groups
- **Tags**: `/api/facebook-accounts/tags` - Get all unique tags across accounts
- **Export**: `/api/facebook-accounts/export` - Individual account export endpoint
- **Messages**: `/api/messages` - Generic messaging/notification endpoint
- **Debug**: `/api/debug/log` - Debug logging endpoint (development only)

All sensitive data is encrypted before storage and decrypted when retrieved.

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
- Provides context-based state management via `ResourceContext` and `useResource()` hook
- Standardizes UI patterns across features
- Handles loading states, error boundaries, and data validation
- Components:
  - `ResourceProvider`: Context provider with state and operations
  - `ResourceList`: Main list UI with search, filters, and actions
  - `ResourceCard`: Individual resource card with menu actions
  - Helper functions: `renderField()`, `renderPasswordField()`, `renderCustomFields()`
- Configurable via config object passed to ResourceProvider:
  - `apiEndpoint`: API URL for CRUD operations
  - `resourceName/resourceNamePlural`: Display names
  - `searchableFields`: Fields available for search
  - `renderResourceContent`: Custom render function for card content
  - `sortResources`: Custom sorting function
  - `customFilter`: Custom filtering logic

## Production Configuration

- **Process Manager**: PM2 with ecosystem.config.js
- **Port**: 3000 (both development and production)
- **Database**: SQLite at `./database/dev.db` (relative to project root)
- **Reverse Proxy**: Nginx configuration for HTTPS termination
- **Backup Schedule**: Automated daily backups via cron jobs
- **Environment Variables**: See `.env.example` for required configuration
  - `DATABASE_URL`: SQLite database path
  - `ENCRYPTION_KEY`: 32-character encryption key (required)
  - `NEXTAUTH_URL` and `NEXTAUTH_SECRET`: Auth configuration
  - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`: ReCAPTCHA keys
  - `EMAIL_USER` and `EMAIL_PASSWORD`: Email notification settings (optional)
  - `WHITELISTED_IPV6`: Whitelisted IP addresses (optional)
  - `BYPASS_AUTH`: Development auth bypass (development only)

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
1. Update Prisma schema in `prisma/schema.prisma`
2. Update `encryptFacebookAccount()` and `decryptFacebookAccount()` in `utils/crypto.js`
3. Update form components and validation
4. Run `npx prisma generate` to regenerate Prisma client
5. Run `npx prisma db push` to update database
6. Test encryption flow thoroughly using browser dev tools and `npx prisma studio`

#### Using ResourceManager for New Features
1. Create a ResourceProvider with appropriate config
2. Define `renderResourceContent` function for custom display logic
3. Implement add/edit modal components
4. Configure `searchableFields` for filtering
5. Add custom menu items via `renderAdditionalMenuItems` if needed
6. Use helper functions (`renderField`, `renderPasswordField`) for consistent UI

#### Modifying FacebookAccountManager
- Keep drag-and-drop experience consistent
- Update filtering logic alongside UI changes
- Ensure encryption logic remains centralized in `utils/crypto.js`
- Validate copy-to-clipboard interactions work across browsers

#### Working with Encryption
- Always use `encrypt()` and `decrypt()` from `utils/crypto.js`
- Use specialized functions `encryptFacebookAccount()` and `decryptFacebookAccount()` for account data
- Never log decrypted sensitive data
- Use `prepareForExport()` for safe data export
- Test encryption/decryption with `npx prisma studio` to verify encrypted values in DB

## Additional Notes

- **Database Backups**: Always run `npm run backup` before deploying schema changes
- **Environment Variables**: Document any new environment variables in `.env.example`
- **Zero-Downtime Deploys**: Use `npm run prod:reload` for production updates
- **PM2 Process Name**: The PM2 process may be named differently than the directory - check `ecosystem.config.js`
- **Cookie Security**: Session cookies are HTTP-only and require HTTPS in production
- **2FA Setup**: Users must set up 2FA via `/settings` after initial login
