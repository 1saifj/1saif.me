# Saif Aljanahi Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS, featuring a complete newsletter system and dark mode support.

## 🚀 Features

- **Modern Design**: Beautiful, responsive design with dark mode support
- **Newsletter System**: Complete email subscription system with EmailJS integration
- **Blog System**: Markdown-based blog with syntax highlighting
- **Project Showcase**: Dynamic project portfolio with filtering
- **PWA Support**: Progressive Web App with offline capabilities
- **SEO Optimized**: Full SEO optimization with meta tags and structured data

## 📧 Newsletter Setup

The portfolio includes a complete newsletter system using EmailJS. Follow these steps to configure it:

### 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Create a new email service (Gmail, Outlook, etc.)
3. Create two email templates:

### 2. Email Templates

**Confirmation Email Template:**
```html
Subject: Confirm your subscription to {{site_name}}

Hello {{to_name}},

Welcome to {{site_name}}! Please confirm your subscription by clicking the link below:

{{confirmation_url}}

If you didn't subscribe to this newsletter, you can safely ignore this email.

Best regards,
{{from_name}}

---
Unsubscribe: {{unsubscribe_url}}
© {{current_year}} {{site_name}}
```

**Newsletter Template:**
```html
Subject: {{subject}}

Hello {{to_name}},

{{content}}

---
Best regards,
{{from_name}}

Unsubscribe: {{unsubscribe_url}}
© {{current_year}} {{site_name}}
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_confirmation_template_id_here
VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID=your_newsletter_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Site Configuration
VITE_SITE_URL=https://yourdomain.com
VITE_SITE_NAME=Your Site Name

# Newsletter Configuration
VITE_NEWSLETTER_FROM_NAME=Your Name
VITE_NEWSLETTER_FROM_EMAIL=your@email.com
```

### 4. Get EmailJS Credentials

1. **Service ID**: Found in EmailJS dashboard under "Email Services"
2. **Template IDs**: Found under "Email Templates" 
3. **Public Key**: Found in "Account" → "General" → "Public Key"

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your EmailJS credentials
```

### Running Locally

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Newsletter.tsx   # Newsletter subscription
│   ├── Blog.tsx        # Blog listing
│   └── ...
├── pages/              # Page components
│   ├── ConfirmSubscriptionPage.tsx
│   ├── UnsubscribePage.tsx
│   └── ...
├── utils/              # Utility functions
│   ├── emailService.ts # Newsletter service
│   └── ...
├── data/               # Static data
└── styles/             # CSS styles
```

## 🎨 Customization

### Colors & Themes

The portfolio uses Tailwind CSS with custom color schemes. Modify `tailwind.config.js` to customize:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Content

- **Blog Posts**: Add markdown files to `content/articles/`
- **Projects**: Add markdown files to `content/projects/`
- **Personal Info**: Update `src/components/Hero.tsx` and `src/components/About.tsx`

## 📊 Newsletter Analytics

The newsletter system provides built-in analytics:

- Total subscribers
- Confirmed subscriptions
- Pending confirmations
- Unsubscribe tracking
- CSV export functionality

Access analytics through the browser console:

```js
import { debugEmailConfig } from './src/utils/emailService'
debugEmailConfig()
```

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Vercel

1. Import project to Vercel
2. Add environment variables
3. Deploy

### Manual Deployment

```bash
# Build the project
npm run build

# Upload dist/ folder to your hosting provider
```

## 📝 Newsletter Management

### Sending Newsletters

```js
import { emailService } from './src/utils/emailService'

// Send newsletter to all confirmed subscribers
await emailService.sendNewsletter(
  'Weekly Update',
  'Your newsletter content here...'
)
```

### Export Subscribers

```js
import { downloadSubscribersCsv } from './src/utils/emailService'

// Download CSV of all subscribers
downloadSubscribersCsv()
```

## 🔒 Privacy & GDPR

The newsletter system is GDPR compliant:

- ✅ Double opt-in confirmation
- ✅ Easy unsubscribe process
- ✅ Data stored locally (no third-party databases)
- ✅ Clear privacy notices
- ✅ User consent tracking

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Loading Speed**: Fast initial load with lazy loading
- **SEO**: Comprehensive meta tags and structured data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help setting up the newsletter system or have questions:

1. Check the [Issues](https://github.com/yourusername/portfolio/issues) page
2. Create a new issue with detailed information
3. Contact: your@email.com

## 🙏 Acknowledgments

- [EmailJS](https://www.emailjs.com/) for email service
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- [Vite](https://vitejs.dev/) for build tooling