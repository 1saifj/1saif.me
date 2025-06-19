# 📧 Cloudflare Workers Newsletter Email Service

A complete email automation service for newsletter subscriptions using Cloudflare Workers and Mailtrap.

## 🚀 Features

- ✅ **Subscription Confirmation Emails** - Beautiful HTML templates with one-click confirmation
- 🎉 **Welcome Emails** - Engaging welcome messages with feature highlights
- 👋 **Unsubscribe Confirmations** - Graceful goodbye emails with feedback collection
- 📬 **Newsletter Sending** - Bulk email sending for confirmed subscribers
- 🔒 **CORS Support** - Properly configured for frontend integration
- 📊 **Health Monitoring** - Built-in health check endpoint
- 🎨 **Responsive Design** - Mobile-friendly email templates with dark mode support

## 🌐 Deployment

The service is deployed at: **https://cloudflare-worker.1saifj.workers.dev**

### Available Endpoints

- `GET /health` - Health check endpoint
- `POST /send-confirmation` - Send subscription confirmation email
- `POST /send-welcome` - Send welcome email to confirmed subscribers
- `POST /send-unsubscribe` - Send unsubscribe confirmation
- `POST /send-newsletter` - Send newsletter to all subscribers (test mode)

## ⚙️ Configuration

### Environment Variables

The following environment variables are already configured in `wrangler.jsonc`:

```json
{
  "vars": {
    "WEBSITE_DOMAIN": "https://1saif.me",
    "FROM_EMAIL": "noreply@1saif.me",
    "FROM_NAME": "Saif Al-Janahi",
    "FIREBASE_PROJECT_ID": "saif-me-newsletter"
  }
}
```

### Required Secrets

The following secrets need to be configured using `wrangler secret put`:

```bash
# Mailtrap API credentials
wrangler secret put MAILTRAP_USERNAME
wrangler secret put MAILTRAP_PASSWORD

# Firebase API key (for future Firestore integration)
wrangler secret put FIREBASE_API_KEY
```

### Mailtrap Setup

1. **Create Mailtrap Account**: Sign up at [mailtrap.io](https://mailtrap.io)
2. **Get API Credentials**: 
   - Go to Email API → Sending Domains
   - Copy your API Token
   - Use the API token as `MAILTRAP_PASSWORD`
   - Username can be any value (required for interface compatibility)

3. **Configure Secrets**:
   ```bash
   wrangler secret put MAILTRAP_USERNAME
   # Enter any username (e.g., "mailtrap")
   
   wrangler secret put MAILTRAP_PASSWORD
   # Enter your Mailtrap API Token
   ```

## 🧪 Testing

### Health Check
```bash
curl "https://cloudflare-worker.1saifj.workers.dev/health"
```

### Send Test Confirmation Email
```bash
curl -X POST "https://cloudflare-worker.1saifj.workers.dev/send-confirmation" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "confirmationToken": "abc123"}'
```

### Send Test Welcome Email
```bash
curl -X POST "https://cloudflare-worker.1saifj.workers.dev/send-welcome" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "unsubscribeToken": "xyz789"}'
```

## 🔧 Development

### Local Development
```bash
npm run dev
# Worker available at http://localhost:8787
```

### Deploy Changes
```bash
npm run deploy
```

### View Logs
```bash
npx wrangler tail
```

## 📱 Frontend Integration

The newsletter service in the main React app (`src/services/newsletterService.ts`) automatically integrates with this Cloudflare Worker:

```typescript
// Automatic email sending on subscription
const result = await emailService.sendConfirmationEmail(email, token);

// Automatic welcome email on confirmation
const welcome = await emailService.sendWelcomeEmail(email, unsubscribeToken);
```

## 🎨 Email Templates

All email templates feature:
- **Modern Design** - Clean, professional layouts with gradients
- **Mobile Responsive** - Optimized for all device sizes
- **Dark Mode Compatible** - Proper color schemes for dark mode
- **Branded Content** - Consistent with 1saif.me brand identity
- **Call-to-Action Buttons** - Clear, prominent action buttons
- **Fallback Text** - Plain text versions for all emails

### Template Types
1. **Confirmation Email** - Purple gradient theme with verification CTA
2. **Welcome Email** - Green gradient theme with feature highlights
3. **Unsubscribe Email** - Orange gradient theme with feedback request

## 🔐 Security

- **CORS Protection** - Properly configured cross-origin requests
- **Input Validation** - All request bodies are validated
- **Error Handling** - Comprehensive error responses
- **Rate Limiting** - Built-in Cloudflare protection
- **Token-based Authentication** - Secure confirmation/unsubscribe flows

## 💰 Cost

- **Cloudflare Workers** - 100,000 requests/day FREE
- **Mailtrap** - 1,000 emails/month FREE
- **Total Monthly Cost** - $0 for small-scale usage

## 🚀 Production Checklist

- [x] Deploy Cloudflare Worker
- [x] Configure environment variables
- [ ] Set up Mailtrap credentials (`MAILTRAP_PASSWORD`)
- [ ] Test email sending functionality
- [ ] Configure Firebase API key (optional)
- [ ] Set up custom domain (optional)
- [ ] Configure email analytics (optional)

## 📊 Monitoring

- **Health Endpoint**: Monitor service availability
- **Cloudflare Analytics**: Request metrics and performance
- **Mailtrap Analytics**: Email delivery and engagement stats
- **Error Logging**: Comprehensive error tracking in Cloudflare dashboard

---

**Next Steps**: Configure Mailtrap credentials to enable email sending functionality. 