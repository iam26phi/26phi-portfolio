# Deployment Guide

This guide covers deploying the 26phi Photography Portfolio to various platforms.

## Table of Contents

1. [Manus Platform (Recommended)](#manus-platform-recommended)
2. [Vercel](#vercel)
3. [Railway](#railway)
4. [Self-Hosted](#self-hosted)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

---

## Manus Platform (Recommended)

The easiest deployment option, as the project is already configured for Manus.

### Steps

1. **Create Checkpoint**
   - Ensure all changes are saved
   - Click "Save Checkpoint" in the Manus UI

2. **Configure Settings**
   - Navigate to Settings → General
   - Set website name and visibility
   - Upload favicon if desired

3. **Database**
   - Database is automatically provisioned
   - Connection details available in Settings → Secrets

4. **Publish**
   - Click the "Publish" button in the top-right
   - Your site will be live at `your-project.manus.space`

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Advantages
- Zero-config deployment
- Automatic SSL certificates
- Built-in database hosting
- OAuth authentication pre-configured
- Automatic scaling

---

## Vercel

Vercel is suitable for the frontend, but requires external database hosting.

### Prerequisites
- Vercel account
- PlanetScale or other MySQL database

### Steps

1. **Prepare Project**
```bash
# Add vercel.json configuration
cat > vercel.json << EOF
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/public",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
```

2. **Deploy**
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all required variables (see Environment Configuration section)

4. **Database Setup**
   - Create a PlanetScale database
   - Run migrations: `pnpm db:push`
   - Update `DATABASE_URL` in Vercel

### Limitations
- Requires external database
- OAuth needs manual configuration
- No built-in file storage

---

## Railway

Railway provides both application and database hosting.

### Steps

1. **Create New Project**
   - Go to railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Add MySQL Database**
   - Click "New" → "Database" → "Add MySQL"
   - Railway will provision a database

3. **Configure Build**
   - Add build command: `pnpm build`
   - Add start command: `pnpm start`

4. **Environment Variables**
   - Railway auto-generates `DATABASE_URL`
   - Add other required variables manually

5. **Deploy**
   - Push to GitHub to trigger deployment
   - Railway will build and deploy automatically

### Advantages
- Integrated database hosting
- Simple GitHub integration
- Automatic deployments

---

## Self-Hosted

For full control, deploy to your own server.

### Prerequisites
- Ubuntu 22.04+ server
- Node.js 22.x
- MySQL 8.0+
- Nginx (for reverse proxy)

### Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

2. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/26phi_portfolio.git
cd 26phi_portfolio

# Install dependencies
pnpm install

# Build
pnpm build

# Create systemd service
sudo tee /etc/systemd/system/26phi.service << EOF
[Unit]
Description=26phi Photography Portfolio
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/26phi_portfolio
ExecStart=/usr/bin/pnpm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl enable 26phi
sudo systemctl start 26phi
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL Certificate**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Secret for JWT signing | Random 32+ character string |
| `OAUTH_SERVER_URL` | OAuth provider URL | `https://api.manus.im` |
| `OWNER_OPEN_ID` | Admin user OpenID | Your OpenID from OAuth provider |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `OWNER_NAME` | Admin display name | `26phi` |

### Frontend Variables (Vite)

All variables prefixed with `VITE_` are exposed to the frontend:

- `VITE_APP_TITLE`: Website title
- `VITE_APP_LOGO`: Logo path
- `VITE_OAUTH_PORTAL_URL`: OAuth login URL

---

## Database Setup

### Creating the Database

```sql
CREATE DATABASE 26phi_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '26phi'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON 26phi_portfolio.* TO '26phi'@'localhost';
FLUSH PRIVILEGES;
```

### Running Migrations

```bash
# Generate and apply migrations
pnpm db:push

# Seed initial data (optional)
pnpm exec tsx migrate-photos.mjs
```

### Backup

```bash
# Backup database
mysqldump -u 26phi -p 26phi_portfolio > backup.sql

# Restore database
mysql -u 26phi -p 26phi_portfolio < backup.sql
```

---

## Troubleshooting

### Build Failures

**Issue**: TypeScript errors during build

**Solution**:
```bash
# Check for errors
pnpm check

# Fix common issues
pnpm install
rm -rf node_modules/.vite
pnpm build
```

### Database Connection Issues

**Issue**: Cannot connect to database

**Solution**:
1. Verify `DATABASE_URL` format
2. Check database server is running
3. Ensure firewall allows connections
4. Test connection:
```bash
mysql -h HOST -u USER -p DATABASE
```

### OAuth Issues

**Issue**: Login not working

**Solution**:
1. Verify `OAUTH_SERVER_URL` is correct
2. Check `OWNER_OPEN_ID` matches your account
3. Ensure `JWT_SECRET` is set
4. Clear browser cookies and try again

### Photo Upload Issues

**Issue**: Photos not displaying

**Solution**:
1. Check file paths in database
2. Verify files exist in `client/public/images/`
3. Check file permissions
4. Ensure `isVisible` is set to `1`

### Performance Issues

**Issue**: Slow page loads

**Solution**:
1. Optimize images (compress, resize)
2. Enable database indexing
3. Add CDN for static assets
4. Enable gzip compression in Nginx

---

## Monitoring

### Logs

```bash
# View application logs (systemd)
sudo journalctl -u 26phi -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

Add a health check endpoint for monitoring:

```typescript
// In server/routers.ts
health: publicProcedure.query(() => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
})),
```

---

## Security Checklist

- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure database passwords
- [ ] Restrict database access by IP
- [ ] Keep dependencies updated (`pnpm update`)
- [ ] Enable firewall rules
- [ ] Regular database backups
- [ ] Monitor error logs
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting for API endpoints

---

## Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Consult platform-specific documentation
4. Open an issue on GitHub

---

**Last Updated**: December 2024
