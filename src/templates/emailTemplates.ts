// Beautiful Email Templates for Newsletter Integration
// Modern, responsive, and accessible email templates

export interface EmailTemplateData {
  email: string;
  confirmationUrl?: string;
  unsubscribeUrl?: string;
  subscriberName?: string;
  companyName?: string;
  websiteUrl?: string;
}

/**
 * Modern Confirmation Email Template
 * Features: Gradient design, responsive, dark mode compatible
 */
export const confirmationEmailTemplate = (data: EmailTemplateData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Subscription</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 50px 40px;
            text-align: center;
        }
        
        .icon-container {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }
        
        .title {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 16px;
        }
        
        .subtitle {
            font-size: 18px;
            color: #64748b;
            margin-bottom: 35px;
        }
        
        .email-highlight {
            background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 30px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
        }
        
        @media (max-width: 600px) {
            .content { padding: 30px 25px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${data.companyName || 'Saif Al-Janahi'}</div>
            <div>Engineering & Innovation</div>
        </div>
        
        <div class="content">
            <div class="icon-container">
                <span style="font-size: 40px;">📧</span>
            </div>
            
            <h1 class="title">Almost There! 🚀</h1>
            <p class="subtitle">
                Thanks for subscribing to our newsletter. Just one more step to complete your subscription.
            </p>
            
            <div class="email-highlight">
                <p>We'll send updates to: <strong>${data.email}</strong></p>
            </div>
            
            <a href="${data.confirmationUrl}" class="cta-button">
                ✨ Confirm Subscription
            </a>
        </div>
        
        <div class="footer">
            <p style="color: #64748b; font-size: 14px;">
                Didn't sign up? You can safely ignore this email.
            </p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Welcome Email Template
 * Sent after successful confirmation
 */
export const welcomeEmailTemplate = (data: EmailTemplateData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Newsletter!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .celebration-emoji {
            font-size: 60px;
            margin-bottom: 20px;
            display: block;
        }
        
        .logo {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 50px 40px;
            text-align: center;
        }
        
        .title {
            font-size: 36px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            line-height: 1.2;
        }
        
        .subtitle {
            font-size: 18px;
            color: #64748b;
            margin-bottom: 35px;
            line-height: 1.5;
        }
        
        .welcome-card {
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
            padding: 30px;
            border-radius: 16px;
            margin: 30px 0;
            border: 1px solid #bbf7d0;
        }
        
        .benefits-list {
            text-align: left;
            margin: 30px 0;
        }
        
        .benefit-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 12px;
        }
        
        .benefit-icon {
            font-size: 24px;
            margin-right: 15px;
            width: 40px;
            text-align: center;
        }
        
        .benefit-text {
            font-size: 16px;
            color: #475569;
            font-weight: 500;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 30px;
            border-radius: 16px;
            margin: 30px 0;
        }
        
        .cta-title {
            color: white;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .cta-text {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 25px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 30px 25px; }
            .header { padding: 30px 25px; }
            .title { font-size: 28px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="celebration-emoji">🎉</span>
            <div class="logo">${data.companyName || 'Saif Al-Janahi'}</div>
        </div>
        
        <div class="content">
            <h1 class="title">Welcome Aboard! 🚀</h1>
            <p class="subtitle">
                Your subscription is confirmed! Get ready for exclusive engineering insights, tutorials, and behind-the-scenes content.
            </p>
            
            <div class="welcome-card">
                <p style="font-size: 18px; color: #059669; font-weight: 600; margin-bottom: 10px;">
                    ✅ You're officially subscribed!
                </p>
                <p style="color: #475569;">
                    Welcome to a community of developers, engineers, and tech enthusiasts.
                </p>
            </div>
            
            <div class="benefits-list">
                <div class="benefit-item">
                    <span class="benefit-icon">📚</span>
                    <span class="benefit-text">In-depth technical tutorials and guides</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">🏗️</span>
                    <span class="benefit-text">System architecture insights and best practices</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">🚀</span>
                    <span class="benefit-text">Early access to new projects and tools</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">💡</span>
                    <span class="benefit-text">Industry insights and career development tips</span>
                </div>
            </div>
            
            <div class="cta-section">
                <h3 class="cta-title">Start Exploring</h3>
                <p class="cta-text">
                    Check out our latest blog posts and dive into the world of modern software engineering.
                </p>
                <a href="${data.websiteUrl}/blog" class="cta-button">
                    🔍 Explore Blog
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 15px;">
                Thanks for joining us! We're excited to share our journey with you.
            </p>
            <p>
                <a href="${data.unsubscribeUrl}" style="color: #64748b; text-decoration: none; font-size: 12px;">
                    Manage subscription preferences
                </a>
            </p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Newsletter Content Template
 * For regular newsletter sends
 */
export const newsletterContentTemplate = (data: EmailTemplateData & {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    readTime: string;
    tags: string[];
  }>;
  monthlyHighlight?: {
    title: string;
    description: string;
    url: string;
  };
}): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Weekly Engineering Digest</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: #f8fafc;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        
        .issue-date {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        
        .newsletter-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .article-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #6366f1;
        }
        
        .article-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
        }
        
        .article-description {
            color: #64748b;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .article-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: #64748b;
        }
        
        .article-link {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .highlight-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 25px;
            border-radius: 16px;
            margin: 30px 0;
            border: 1px solid #fbbf24;
        }
        
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }
        
        .tag {
            background: #e2e8f0;
            color: #475569;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
        }
        
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 25px 20px; }
            .header { padding: 25px 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="issue-date">${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
            <h1 class="newsletter-title">📬 Engineering Digest</h1>
            <p>Your weekly dose of technical insights</p>
        </div>
        
        <div class="content">
            ${data.monthlyHighlight ? `
            <div class="highlight-section">
                <h2 style="color: #92400e; margin-bottom: 15px;">⭐ Monthly Highlight</h2>
                <h3 style="color: #1e293b; margin-bottom: 10px;">${data.monthlyHighlight.title}</h3>
                <p style="color: #475569; margin-bottom: 15px;">${data.monthlyHighlight.description}</p>
                <a href="${data.monthlyHighlight.url}" style="background: #92400e; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 500;">
                    Read Featured Article →
                </a>
            </div>
            ` : ''}
            
            <h2 class="section-title">📚 Latest Articles</h2>
            
            ${data.articles.map(article => `
                <div class="article-card">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-description">${article.description}</p>
                    <div class="tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="article-meta">
                        <span>⏱ ${article.readTime} min read</span>
                        <a href="${article.url}" class="article-link">Read More →</a>
                    </div>
                </div>
            `).join('')}
            
            <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <h3 style="color: #1e293b; margin-bottom: 15px;">💬 Let's Connect</h3>
                <p style="color: #64748b; margin-bottom: 20px;">
                    Have questions or want to discuss any of these topics? I'd love to hear from you!
                </p>
                <a href="mailto:${data.email}" style="background: #1e293b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                    Reply to This Email 📧
                </a>
            </div>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 15px;">
                Thanks for being a valued subscriber! 🙏
            </p>
            <p>
                <a href="${data.unsubscribeUrl}" style="color: #64748b; text-decoration: none; font-size: 12px;">
                    Unsubscribe or manage preferences
                </a>
            </p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Unsubscribe Confirmation Template
 */
export const unsubscribeConfirmationTemplate = (data: EmailTemplateData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribed Successfully</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 500px;
            margin: 50px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            text-align: center;
        }
        
        .content {
            padding: 60px 40px;
        }
        
        .sad-emoji {
            font-size: 80px;
            margin-bottom: 30px;
            display: block;
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .feedback-section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
        }
        
        .resubscribe-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            margin: 15px 0;
        }
        
        @media (max-width: 600px) {
            .container { margin: 20px 10px; }
            .content { padding: 40px 25px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <span class="sad-emoji">😢</span>
            <h1 class="title">You've Been Unsubscribed</h1>
            <p class="message">
                We're sorry to see you go! Your email <strong>${data.email}</strong> has been successfully removed from our newsletter.
            </p>
            
            <div class="feedback-section">
                <p style="font-size: 14px; color: #475569; margin-bottom: 15px;">
                    <strong>Help us improve:</strong> We'd love to know why you unsubscribed. Your feedback helps us create better content.
                </p>
            </div>
            
            <p style="color: #64748b; margin: 25px 0;">
                Changed your mind? You can always resubscribe anytime.
            </p>
            
            <a href="${data.websiteUrl}" class="resubscribe-button">
                🔄 Resubscribe
            </a>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
                Thank you for being part of our community! 💙
            </p>
        </div>
    </div>
</body>
</html>
`;

// Export all templates
export const emailTemplates = {
  confirmation: confirmationEmailTemplate,
  welcome: welcomeEmailTemplate,
  newsletter: newsletterContentTemplate,
  unsubscribe: unsubscribeConfirmationTemplate
}; 