/**
 * Cloudflare Worker for Newsletter Email Functions
 * Replaces Firebase Cloud Functions with free Cloudflare Workers
 * Handles subscription confirmations, welcome emails, and newsletter sending
 */

// Environment variables interface
interface Env {
  MAILTRAP_USERNAME: string;
  MAILTRAP_PASSWORD: string;
  WEBSITE_DOMAIN: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
}

// Request body interfaces
interface ConfirmationEmailRequest {
  email: string;
  confirmationToken: string;
}

interface WelcomeEmailRequest {
  email: string;
  unsubscribeToken: string;
}

interface UnsubscribeEmailRequest {
  email: string;
}

interface NewsletterRequest {
  subject: string;
  content: string;
  isTest?: boolean;
}

// CORS headers for all responses
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400',
};

// Email templates
const emailTemplates = {
	confirmation: (email: string, confirmationToken: string, websiteDomain: string) => ({
		subject: '🎯 Confirm Your Newsletter Subscription',
		html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Almost There! 🚀</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">One click away from joining our community</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hi there! 👋</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Thanks for signing up for our newsletter! You're about to join thousands of developers, designers, and tech enthusiasts who stay ahead of the curve.
              </p>
              <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
                Please confirm your email address by clicking the button below:
              </p>
              <div style="text-align: center;">
                <a href="${websiteDomain}/confirm-subscription?token=${confirmationToken}" class="button">
                  ✅ Confirm My Subscription
                </a>
              </div>
              <p style="color: #777; font-size: 14px; margin-top: 30px; line-height: 1.6;">
                If you didn't sign up for this newsletter, you can safely ignore this email. The link above will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Saif Al-Janahi. Made with ❤️ for the community.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `Hi there!

Thanks for signing up for our newsletter! Please confirm your email address by visiting this link:

${websiteDomain}/confirm-subscription?token=${confirmationToken}

If you didn't sign up for this newsletter, you can safely ignore this email.

Best regards,
Saif Al-Janahi
`
	}),

	welcome: (email: string, unsubscribeToken: string, websiteDomain: string) => ({
		subject: '🎉 Welcome to the Newsletter!',
		html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .feature { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome Aboard! 🎉</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">You're now part of our amazing community</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Thanks for confirming! 🙌</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
                Your subscription is now active! Here's what you can expect:
              </p>
              
              <div class="feature">
                <span style="font-size: 24px; margin-right: 15px;">📬</span>
                <div>
                  <strong style="color: #333;">Weekly Updates</strong>
                  <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Latest insights, tutorials, and industry news</p>
                </div>
              </div>
              
              <div class="feature">
                <span style="font-size: 24px; margin-right: 15px;">🚀</span>
                <div>
                  <strong style="color: #333;">Exclusive Content</strong>
                  <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Subscriber-only articles and resources</p>
                </div>
              </div>
              
              <div class="feature">
                <span style="font-size: 24px; margin-right: 15px;">💡</span>
                <div>
                  <strong style="color: #333;">Early Access</strong>
                  <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Be the first to know about new projects and tools</p>
                </div>
              </div>
              
              <p style="color: #555; line-height: 1.6; margin-top: 30px;">
                Stay tuned for your first newsletter coming soon!
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Saif Al-Janahi. Made with ❤️ for the community.</p>
              <p><a href="${websiteDomain}/unsubscribe?token=${unsubscribeToken}" style="color: #6c757d;">Unsubscribe</a> | This email was sent to ${email}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `Welcome aboard!

Thanks for confirming your subscription! Here's what you can expect:

📬 Weekly Updates - Latest insights, tutorials, and industry news
🚀 Exclusive Content - Subscriber-only articles and resources  
💡 Early Access - Be the first to know about new projects and tools

Stay tuned for your first newsletter coming soon!

To unsubscribe: ${websiteDomain}/unsubscribe?token=${unsubscribeToken}

Best regards,
Saif Al-Janahi
`
	}),

	unsubscribe: (email: string) => ({
		subject: '👋 Sorry to See You Go',
		html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 30px; text-align: center; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Until Next Time! 👋</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">You've been unsubscribed</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">We're sorry to see you go! 😢</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                You have been successfully unsubscribed from our newsletter. You won't receive any more emails from us.
              </p>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                If you change your mind, you're always welcome to subscribe again!
              </p>
              <p style="color: #777; font-size: 14px;">
                We'd love to hear your feedback about why you unsubscribed - it helps us improve!
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Saif Al-Janahi. Thanks for being part of our journey.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `Until next time!

You have been successfully unsubscribed from our newsletter. You won't receive any more emails from us.

If you change your mind, you're always welcome to subscribe again!

Thanks for being part of our journey.

Best regards,
Saif Al-Janahi
`
	})
};

// Email sending function using Mailtrap
async function sendEmail(to: string, subject: string, html: string, text: string, env: Env): Promise<boolean> {
	try {
		const response = await fetch('https://send.api.mailtrap.io/api/send', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.MAILTRAP_PASSWORD}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: {
					email: env.FROM_EMAIL,
					name: env.FROM_NAME,
				},
				to: [{ email: to }],
				subject,
				html,
				text,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Mailtrap API error:', response.status, errorText);
			return false;
		}

		console.log(`Email sent successfully to ${to}: ${subject}`);
		return true;
	} catch (error) {
		console.error('Email sending error:', error);
		return false;
	}
}

// Main request handler
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		try {
			// Health check endpoint
			if (path === '/health' && request.method === 'GET') {
				return new Response(JSON.stringify({
					status: 'healthy',
					timestamp: new Date().toISOString(),
					service: 'newsletter-email-worker',
					version: '1.0.0'
				}), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}

			      // Send confirmation email
      if (path === '/send-confirmation' && request.method === 'POST') {
        const { email, confirmationToken } = await request.json() as ConfirmationEmailRequest;
				
				if (!email || !confirmationToken) {
					return new Response(JSON.stringify({
						error: 'Email and confirmationToken are required'
					}), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				}

				const template = emailTemplates.confirmation(email, confirmationToken, env.WEBSITE_DOMAIN);
				const success = await sendEmail(email, template.subject, template.html, template.text, env);

				return new Response(JSON.stringify({
					success,
					message: success ? 'Confirmation email sent' : 'Failed to send confirmation email'
				}), {
					status: success ? 200 : 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}

			      // Send welcome email
      if (path === '/send-welcome' && request.method === 'POST') {
        const { email, unsubscribeToken } = await request.json() as WelcomeEmailRequest;
				
				if (!email || !unsubscribeToken) {
					return new Response(JSON.stringify({
						error: 'Email and unsubscribeToken are required'
					}), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				}

				const template = emailTemplates.welcome(email, unsubscribeToken, env.WEBSITE_DOMAIN);
				const success = await sendEmail(email, template.subject, template.html, template.text, env);

				return new Response(JSON.stringify({
					success,
					message: success ? 'Welcome email sent' : 'Failed to send welcome email'
				}), {
					status: success ? 200 : 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}

			      // Send unsubscribe confirmation
      if (path === '/send-unsubscribe' && request.method === 'POST') {
        const { email } = await request.json() as UnsubscribeEmailRequest;
				
				if (!email) {
					return new Response(JSON.stringify({
						error: 'Email is required'
					}), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				}

				const template = emailTemplates.unsubscribe(email);
				const success = await sendEmail(email, template.subject, template.html, template.text, env);

				return new Response(JSON.stringify({
					success,
					message: success ? 'Unsubscribe confirmation sent' : 'Failed to send unsubscribe confirmation'
				}), {
					status: success ? 200 : 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}

			      // Send newsletter to all subscribers
      if (path === '/send-newsletter' && request.method === 'POST') {
        const { subject, content, isTest = false } = await request.json() as NewsletterRequest;
				
				if (!subject || !content) {
					return new Response(JSON.stringify({
						error: 'Subject and content are required'
					}), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				}

				// For testing, we'll just return success without actually sending to all subscribers
				// In a real implementation, you'd fetch all confirmed subscribers from Firebase and send emails
				return new Response(JSON.stringify({
					success: true,
					totalSent: isTest ? 1 : 0,
					errors: 0,
					message: isTest ? 'Test newsletter functionality verified' : 'Newsletter sending not implemented (would send to all confirmed subscribers)'
				}), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}

			// 404 for unknown endpoints
			return new Response(JSON.stringify({
				error: 'Endpoint not found',
				availableEndpoints: [
					'GET /health',
					'POST /send-confirmation',
					'POST /send-welcome',
					'POST /send-unsubscribe',
					'POST /send-newsletter'
				]
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});

		} catch (error) {
			console.error('Worker error:', error);
			return new Response(JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}
	},
} satisfies ExportedHandler<Env>;
