# Firebase Functions for Newsletter System

This directory contains Firebase Cloud Functions that power the newsletter system with automated email sending capabilities using Mailtrap.

## 🚀 Features

- **Automated Email Triggers**: Sends confirmation and welcome emails automatically
- **Subscription Management**: Handles email confirmations and unsubscriptions
- **Newsletter Broadcasting**: Send newsletters to all confirmed subscribers
- **Analytics Tracking**: Tracks subscription events and email metrics
- **Mailtrap Integration**: Uses Mailtrap for reliable email delivery
- **Environment-based Configuration**: Supports development and production environments

## 📁 Project Structure

```
functions/
├── src/
│   └── index.ts          # Main functions file with all email logic
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (you need to configure)
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## ⚙️ Environment Setup

### 1. Configure Mailtrap

1. Sign up for [Mailtrap](https://mailtrap.io/)
2. Get your SMTP credentials from your Mailtrap account
3. Update the `.env` file in this directory:

```bash
# Mailtrap Configuration
MAILTRAP_USERNAME=your_mailtrap_username
MAILTRAP_PASSWORD=your_mailtrap_password

# Your website domain
WEBSITE_DOMAIN=https://saifj.dev

# Email sender configuration
FROM_EMAIL=noreply@saifj.dev
FROM_NAME=Saif Al-Janahi

# Environment
NODE_ENV=development
```

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onNewSubscriber
```

## 🔧 Available Functions

### Firestore Triggers

- **`onNewSubscriber`**: Automatically sends confirmation email when a new subscriber is added
- **`onSubscriberConfirmed`**: Sends welcome email when subscription is confirmed

### HTTP Functions

- **`confirmSubscription`**: Handles email confirmation links
- **`unsubscribe`**: Handles unsubscription requests
- **`healthCheck`**: Simple health check endpoint

### Callable Functions

- **`sendNewsletter`**: Send newsletter to all confirmed subscribers (admin only)

## 📧 Email Templates

The functions include beautiful, responsive email templates:

### Confirmation Email
- Gradient design with call-to-action button
- Mobile-responsive layout
- Clear confirmation instructions

### Welcome Email
- Professional welcome message
- Feature highlights
- Unsubscribe link

### Unsubscribe Email
- Polite goodbye message
- Feedback collection opportunity

## 🔐 Security Features

- **Token-based Authentication**: Secure confirmation and unsubscribe tokens
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Validates all email addresses and tokens
- **Environment Separation**: Different SMTP hosts for development/production

## 📊 Analytics

Functions automatically track:
- Subscription confirmations
- Unsubscription events
- Newsletter send statistics
- Email delivery metrics

## 🚀 Usage Examples

### Send Test Newsletter

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendNewsletter = httpsCallable(functions, 'sendNewsletter');

const result = await sendNewsletter({
  subject: 'Weekly Tech Update',
  content: '<h1>Hello subscribers!</h1><p>Here are this week\'s updates...</p>',
  isTest: true // Adds [TEST] prefix to subject
});
```

### Manual Subscription Confirmation

```javascript
// User clicks confirmation link
// GET /confirmSubscription?token=abc123
// Function automatically handles the rest
```

## 🔧 Development

### Local Testing

```bash
# Start Firebase emulators
firebase emulators:start

# Test functions locally
curl http://localhost:5001/your-project/us-central1/healthCheck
```

### Environment Variables

- **Development**: Uses `sandbox.smtp.mailtrap.io`
- **Production**: Uses `live.smtp.mailtrap.io`

## 📝 Logs

Monitor function execution:

```bash
# View logs
firebase functions:log

# View specific function logs
firebase functions:log --only onNewSubscriber
```

## 🚨 Troubleshooting

### Common Issues

1. **Email not sending**: Check Mailtrap credentials in `.env`
2. **Function deployment fails**: Ensure Firebase CLI is installed and authenticated
3. **Environment variables not loading**: Verify `.env` file exists and has correct format

### Debug Tips

- Check Firebase Functions logs for detailed error messages
- Verify Firestore security rules allow function access
- Test email templates in Mailtrap interface

## 🔄 Updates and Maintenance

### Adding New Email Templates

1. Add template to `emailTemplates` object in `index.ts`
2. Create corresponding function trigger
3. Test in development environment
4. Deploy to production

### Modifying Email Content

Update the HTML templates in the `emailTemplates` object. All templates are mobile-responsive and support dark mode.

## 📈 Performance

- Functions use batching for newsletter sending (100 emails per batch)
- Implements delays between batches to respect rate limits
- Tracks success/error rates for monitoring

## 🔒 Security Best Practices

- Never commit `.env` file to version control
- Use Firebase security rules to protect Firestore collections
- Implement admin authentication for newsletter sending
- Regularly rotate Mailtrap credentials

---

Need help? Check the [Firebase Functions documentation](https://firebase.google.com/docs/functions) or [Mailtrap documentation](https://help.mailtrap.io/). 