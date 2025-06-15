# Cloudflare Pages Deployment Guide

This guide will help you deploy the Saif Aljanahi Portfolio to Cloudflare Pages.

## Prerequisites

- GitHub repository with your portfolio code
- Cloudflare account (free tier is sufficient)
- Domain name (optional, for custom domain)

## Step 1: Prepare Your Repository

1. **Ensure all files are committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "feat: prepare for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Verify build works locally:**
   ```bash
   npm run build:production
   ```

## Step 2: Create Cloudflare Pages Project

1. **Log in to Cloudflare Dashboard:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create a new project:**
   - Click "Create a project"
   - Choose "Connect to Git"
   - Select your GitHub repository
   - Click "Begin setup"

3. **Configure build settings:**
   ```
   Framework preset: Vite
   Build command: npm run build:ci
   Build output directory: dist
   Root directory: / (leave empty)
   ```

4. **Environment variables (Required):**
   Add these in the "Environment variables" section:
   ```
   NODE_VERSION=18
   NPM_FLAGS=--legacy-peer-deps
   ```

## Step 3: Advanced Configuration

### Build Settings
- **Node.js version:** 18 (specified in `.nvmrc`)
- **Package manager:** npm (specified in `.npmrc`)
- **Build command:** `npm run build`
- **Output directory:** `dist`

### Environment Variables (Optional)
If you're using EmailJS or other services, add these:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_GISCUS_REPO=your_repo
VITE_GISCUS_REPO_ID=your_repo_id
VITE_GISCUS_CATEGORY=your_category
VITE_GISCUS_CATEGORY_ID=your_category_id
```

## Step 4: Custom Domain (Optional)

1. **Add custom domain:**
   - In your Pages project, go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter your domain (e.g., `saifaljanahi.dev`)

2. **Configure DNS:**
   - Add a CNAME record pointing to your Pages URL
   - Or use Cloudflare as your DNS provider for automatic setup

## Step 5: Performance Optimization

The following files are already configured for optimal performance:

### `_headers` file:
- Security headers (CSP, HSTS, etc.)
- Cache control for static assets
- Performance optimizations

### `_redirects` file:
- SPA routing configuration
- SEO-friendly redirects

### `wrangler.toml`:
- Cloudflare Pages configuration
- Build settings
- Environment variables template

## Step 6: Deployment Process

1. **Automatic deployments:**
   - Every push to `main` branch triggers a new deployment
   - Preview deployments for pull requests

2. **Manual deployment:**
   - Go to your Pages project dashboard
   - Click "Create deployment"
   - Upload the `dist` folder

## Step 7: Verification

After deployment, verify:

1. **Site loads correctly:** Visit your Pages URL
2. **All routes work:** Test navigation between pages
3. **Forms function:** Test contact form and newsletter
4. **Performance:** Run Lighthouse audit
5. **SEO:** Check meta tags and structured data

## Troubleshooting

### Common Issues:

1. **Build fails with dependency errors:**
   ```bash
   # Solution: Use legacy peer deps
   npm install --legacy-peer-deps
   ```

2. **404 errors on page refresh:**
   - Ensure `_redirects` file is in the root directory
   - Check SPA routing configuration

3. **Environment variables not working:**
   - Verify variables are prefixed with `VITE_`
   - Check they're set in Cloudflare Pages dashboard

4. **Slow build times:**
   - Enable build caching in Cloudflare Pages
   - Optimize dependencies

### Build Commands for Different Scenarios:

```bash
# Development build
npm run dev

# Production build with testing
npm run build:production

# Preview build locally
npm run preview

# Analyze bundle size
npm run analyze
```

## Performance Features

Your portfolio includes:

- ✅ **CDN optimization** via Cloudflare's global network
- ✅ **Asset optimization** with proper caching headers
- ✅ **Code splitting** for faster loading
- ✅ **Image optimization** with WebP support
- ✅ **Security headers** for protection
- ✅ **PWA features** with service worker
- ✅ **SEO optimization** with meta tags and structured data

## Monitoring

After deployment, consider setting up:

1. **Analytics:** Google Analytics or Cloudflare Analytics
2. **Error tracking:** Sentry or similar service
3. **Uptime monitoring:** Cloudflare or third-party service
4. **Performance monitoring:** Web Vitals tracking

## Support

For issues:
1. Check Cloudflare Pages documentation
2. Review build logs in Cloudflare dashboard
3. Test locally with `npm run build:production`
4. Check this repository's issues section

---

**Deployment Status:** Ready for production ✅
**Last Updated:** December 2024
**Build Size:** ~406KB (104KB gzipped) 