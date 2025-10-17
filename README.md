# SocialVault - Facebook Account Manager 🔒

A secure, streamlined web application for managing Facebook account credentials with advanced security features. Built with Next.js 14 and Prisma.

## 🌟 Features

### Facebook Account Management
- **Secure Credential Storage**: End-to-end AES encrypted storage of Facebook credentials
- **2FA Integration**: TOTP-based two-factor authentication with real-time code generation
- **Comprehensive Account Data**: 
  - User ID and password management
  - Email and email password storage
  - Recovery email tracking
  - 2FA secret storage with live code display
  - Date of birth tracking
- **Smart Organization**:
  - Drag-and-drop reordering for account prioritization
  - Flexible tagging system for categorization
  - Advanced tag-based filtering (supports any combination of tags)
- **Data Export**: Export account data in text or JSON format
- **One-click Copy**: Quick clipboard access for all credentials

### Security Features
- **Multi-layer Authentication**: Session-based auth with optional 2FA
- **Data Encryption**: All sensitive data encrypted before database storage
- **Secure Sessions**: HTTP-only cookies with 24-hour expiration
- **Development Flexibility**: Optional auth bypass for development environments

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Immediate reflection of changes without page refresh
- **Error Handling**: Robust error boundaries and user feedback
- **Minimalist Interface**: Clean, security-focused interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- SQLite
- PM2 for production
- Nginx for reverse proxy

### Development Setup

1. Clone and navigate:
```bash
git clone https://github.com/cosmicpush/socialvault.git
cd socialvault
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
DATABASE_URL="file:./database/dev.db"
NEXT_PUBLIC_ENCRYPTION_KEY="your-32-char-encryption-key"

# Optional: Disable auth for development
DEV_MODE_BYPASS_AUTH="true"

# Optional: Email settings for notifications
EMAIL_USER="your-gmail-address@gmail.com"
EMAIL_PASSWORD="your-app-specific-password"
```

4. Initialize database:
```bash
mkdir -p database
npm run setup
```

5. Create your first user:
```bash
node scripts/create-user.js
```

6. Start development server:
```bash
npm run dev
```

### Production Deployment

1. Create the hosting directory and clone:
```bash
mkdir -p /var/www/bharatiyanews.com
cd /var/www/bharatiyanews.com
git clone https://github.com/cosmicpush/socialvault.git .
```

2. Initial setup:
```bash
npm run prod:setup
```

3. Configure Nginx:
```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SSL configuration
    listen 443 ssl;
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

4. Start production server:
```bash
npm run prod:start
```

## 🔧 Technology Stack

### Frontend
- React 18 with Next.js 14 (App Router)
- TailwindCSS for styling
- Radix UI for accessible components
- Lucide React for icons
- React Error Boundary for error handling

### Backend
- Next.js API Routes
- Prisma ORM with SQLite database
- CryptoJS for AES encryption
- OTPLib for TOTP 2FA

### Security
- Custom authentication middleware
- HTTP-only secure cookie sessions
- AES encryption for all sensitive data
- TOTP-based two-factor authentication
- Rate limiting and input sanitization

### Development
- TypeScript support
- ESLint + Prettier for code quality
- PM2 Process Manager for production

## 📂 Project Structure

```
socialvault/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── facebook-accounts/ # Facebook account CRUD
│   ├── facebook-accounts/ # Main Facebook accounts page
│   ├── login/            # Authentication pages
│   └── settings/         # User settings (2FA setup)
├── components/            # React components
│   ├── FacebookAccountManager.jsx # Main account management
│   ├── common/           # Shared components (ResourceManager)
│   ├── layout/           # Header/Footer components
│   └── ui/               # UI components (buttons, cards)
├── database/             # SQLite database location
├── prisma/               # Database schema and migrations
├── public/               # Static files and assets
├── scripts/              # Utility and maintenance scripts
├── utils/                # Helper functions
│   ├── crypto.js         # Encryption/decryption functions
│   ├── 2fa.js           # 2FA utilities
│   └── prisma.js        # Database connection
└── ecosystem.config.js   # PM2 configuration
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - TypeScript type checking

### Production
- `npm run prod:setup` - Initial production setup
- `npm run prod:start` - Start with PM2
- `npm run prod:stop` - Stop PM2 process
- `npm run prod:restart` - Restart PM2 process
- `npm run prod:reload` - Zero-downtime updates

### Database
- `npm run backup` - Backup SQLite database
- `npm run restore` - Restore database from backup
- `npm run check-db` - Check database health
- `npm run debug-user` - Debug user authentication issues
- `npx prisma studio` - Open database GUI

### Maintenance
- `npm run maintenance:start` - Enter maintenance mode (backup + stop)
- `npm run maintenance:end` - Exit maintenance mode (build + restart)

## 🔒 Database Schema

The application uses two main database models:

### User Model
- User authentication and 2FA settings
- Session management
- Login tracking

### FacebookAccount Model
- Encrypted Facebook credentials
- Account metadata (tags, DOB)
- Drag-and-drop ordering support
- Created/updated timestamps

All sensitive data is automatically encrypted before storage using AES encryption.

## 🔄 Updates & Maintenance

1. Start maintenance mode:
```bash
npm run maintenance:start
```

2. Update application:
```bash
git pull
npm install
npm run maintenance:end
```

## 🔐 Security Best Practices

- All sensitive data is encrypted with AES before database storage
- Session tokens are HTTP-only and secure
- 2FA is available for enhanced security
- Environment variables manage encryption keys
- Regular automated backups
- No sensitive data in logs or error messages
- HTTPS enforced in production

## 🧩 Key Components

### FacebookAccountManager
- Main interface for account management
- Drag-and-drop functionality for reordering
- Advanced filtering and search capabilities
- Real-time TOTP code generation
- Secure copy-to-clipboard functionality

### ResourceManager
- Reusable component system for CRUD operations
- Built-in encryption/decryption handling
- Consistent UI patterns across features
- Error handling and loading states

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns and security practices
4. Test encryption/decryption flows thoroughly
5. Ensure all sensitive data uses the crypto utilities
6. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Authentication Problems:**
- Use `npm run debug-user` to check user status
- Verify 2FA setup with QR code regeneration
- Check cookie settings and HTTPS configuration

**Database Issues:**
- Run `npm run check-db` for health check
- Use database backup/restore scripts
- Check file permissions on database directory

**Production Deployment:**
- Verify PM2 process status: `pm2 status`
- Check Nginx configuration and logs
- Ensure environment variables are set correctly

## 📄 License

MIT License. See [LICENSE](LICENSE) for more information.

---

**SocialVault** - Secure Facebook Account Management  
Made with ❤️ and 🔐 by Devashish Sharma  
Contact: mrdevashish1999@gmail.com
