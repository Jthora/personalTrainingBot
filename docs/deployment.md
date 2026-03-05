# Deployment Guide

## Overview

This guide covers deploying the Personal Training Bot to various environments including local development, staging, and production.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git

## Environment Configuration

### Environment Variables

Create appropriate `.env` files for each environment:

#### Development (.env.development)
```env
VITE_APP_NAME=Personal Training Bot (Dev)
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG=true
```

#### Production (.env.production)
```env
VITE_APP_NAME=Personal Training Bot
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_DEBUG=false
```

## Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The build process includes:
1. Path generation for training modules
2. TypeScript compilation
3. Vite bundling and optimization
4. Asset optimization

## Deployment Options

### 1. Vercel (Recommended)

The project is already configured for Vercel deployment.

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

### 2. Netlify

#### Build Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

#### Deploy Steps
1. Connect repository to Netlify
2. Configure build settings
3. Set environment variables
4. Deploy

### 3. Static Hosting (GitHub Pages, S3, etc.)

#### Build for Static Hosting
```bash
npm run build
```

#### Deploy to GitHub Pages
```bash
npm run build
npm run deploy
```

### 4. Self-Hosted

#### Using Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

#### Using PM2
```bash
npm install -g pm2
npm run build
pm2 start ecosystem.config.js
```

## Performance Optimization

### Build Optimization
- Code splitting is enabled by default
- Assets are automatically optimized
- Gzip compression is applied

### Caching headers & verification
- Static headers file: `public/_headers` ships cache policies for HTML (no-cache), hashed assets (1 year, immutable), training manifest (5 minutes), training shards/JSON (1 day with stale-while-revalidate).
- When deploying to Netlify/Vercel/static hosts that honor `_headers`, ensure the file is copied to the root of the published site (Vite already copies `public/*`).
- Verify headers after deploy:

```bash
# Manifest should be short-lived
curl -I https://<your-domain>/training_modules_manifest.json | grep -i cache-control

# Shards should be cached but revalidated daily
curl -I https://<your-domain>/training_modules_shards/fitness.json | grep -i cache-control

# Hashed assets should be immutable
curl -I https://<your-domain>/assets/index-*.js | grep -i cache-control
```

### Service worker + offline checks
- Service worker at `/sw.js` registers automatically in production builds; scope is the site root. It caches the manifest + training shards cache-first with background refresh.
- Updates call `SKIP_WAITING` so the new worker takes control without a manual page reload.
- QA steps (requires preview/prod host):
	1) `npm run preview -- --host --port 4173` (or use your deployed host).
	2) Open the app, trigger training shard loads (navigate to Training), then go offline and confirm cached shards serve.
	3) Automated checks:
		- `npm run check:sw-offline -- --base=http://localhost:4173 --shard=/training_modules_shards/fitness.json`
		- `npm run check:offline-indicator -- --base=http://localhost:4173` (verifies the on-screen online/offline indicator flips when connectivity is cut)

### Runtime Optimization
- Implement service worker for caching
- Use CDN for static assets
- Enable browser caching headers

## Monitoring and Analytics

### Error Tracking
Consider integrating:
- Sentry for error monitoring
- LogRocket for session replay
- Google Analytics for usage tracking

### Performance Monitoring
- Web Vitals tracking
- Bundle size monitoring
- Loading time metrics

## Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### HTTPS
- Always use HTTPS in production
- Implement proper certificate management
- Use security headers

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

#### Asset Loading Issues
- Verify asset paths are correct
- Check build output structure
- Ensure assets are properly included

#### Performance Issues
- Analyze bundle size
- Check for memory leaks
- Optimize images and assets

### Debugging

#### Development
```bash
npm run dev -- --debug
```

#### Production
- Use browser developer tools
- Check console for errors
- Monitor network requests

## Rollback Procedures

### Vercel
- Use Vercel dashboard to rollback to previous deployment
- Or redeploy from specific Git commit

### Manual Rollback
```bash
# Rollback to previous version
git checkout previous-release-tag
npm run build
# Deploy using your preferred method
```

## Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update Node.js version as needed

### Backup
- Regular database backups (if applicable)
- Source code is backed up in Git
- Configuration and environment variable backups

## Support

For deployment issues:
1. Check this documentation
2. Review error logs
3. Check GitHub Issues
4. Contact development team
