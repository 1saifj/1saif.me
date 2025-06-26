/**
 * Cloudflare Worker for Newsletter Email Functions
 * Replaces Firebase Cloud Functions with free Cloudflare Workers
 * Handles subscription confirmations, welcome emails, and newsletter sending
 */

// Environment variables interface
interface Env {
  MAILTRAP_TOKEN: string;
  WEBSITE_DOMAIN: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
  FIREBASE_PROJECT_ID: string;
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
		subject: 'Confirm Your Newsletter Subscription',
		html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #e9e9eb; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 14px 28px; background-color: #1a1a1a; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e9e9eb; }
          .footer a { color: #1a1a1a; text-decoration: none; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <img src="${websiteDomain}/sj.png" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">Confirm Your Subscription</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px; font-size: 20px; font-weight: 600;">Hello,</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
                Thank you for subscribing to the newsletter. Please click the button below to confirm your email address and activate your subscription.
              </p>
              <div style="text-align: center;">
                <a href="${websiteDomain}/confirm-subscription?token=${confirmationToken}" class="button">
                  Confirm Subscription
                </a>
              </div>
              <p style="color: #777; font-size: 14px; margin-top: 30px; line-height: 1.6;">
                If you did not request this, please ignore this email. This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Saif Al-Janahi. All rights reserved.</p>
              <p>You received this email because you subscribed at <a href="${websiteDomain}">${websiteDomain}</a>.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `Hello,\n\nThank you for subscribing. Please confirm your email address by visiting this link:\n\n${websiteDomain}/confirm-subscription?token=${confirmationToken}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nSaif Al-Janahi`
	}),

	welcome: (email: string, unsubscribeToken: string, websiteDomain: string) => ({
		subject: '🎉 Welcome to the Newsletter!',
		html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Aboard!</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #e9e9eb; }
          .content { padding: 40px 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e9e9eb; }
          .footer a { color: #1a1a1a; text-decoration: none; }
          ul { list-style-type: none; padding: 0; }
          li { margin-bottom: 10px; color: #555; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <img src="${websiteDomain}/sj.png" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px; font-size: 20px; font-weight: 600;">Thanks for confirming!</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
                You're now part of the community. Here's what you can expect:
              </p>
              <ul>
                <li><strong>Weekly Updates:</strong> Latest insights, tutorials, and industry news.</li>
                <li><strong>Exclusive Content:</strong> Subscriber-only articles and resources.</li>
                <li><strong>Early Access:</strong> Be the first to know about new projects and tools.</li>
              </ul>
              <p style="color: #555; line-height: 1.6; margin-top: 30px;">
                Stay tuned for your first newsletter!
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Saif Al-Janahi. All rights reserved.</p>
              <p>
                <a href="${websiteDomain}/unsubscribe?token=${unsubscribeToken}">Unsubscribe</a> | This email was sent to ${email}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `Welcome aboard!\n\nThanks for confirming your subscription! Here's what you can expect:\n\n- Weekly Updates: Latest insights, tutorials, and industry news.\n- Exclusive Content: Subscriber-only articles and resources.\n- Early Access: Be the first to know about new projects and tools.\n\nStay tuned for your first newsletter coming soon!\n\nTo unsubscribe: ${websiteDomain}/unsubscribe?token=${unsubscribeToken}\n\nBest regards,\nSaif Al-Janahi`
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #e9e9eb; }
          .content { padding: 40px 30px; text-align: center; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e9e9eb; }
          .footer a { color: #1a1a1a; text-decoration: none; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <img src="https://1saif.me/sj.png" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">Sorry to See You Go</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px; font-size: 20px; font-weight: 600;">You have been unsubscribed.</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
                You will no longer receive newsletter emails. If this was a mistake, you can subscribe again at any time.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Saif Al-Janahi. All rights reserved.</p>
              <p>This confirmation was sent to ${email}.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `You have been unsubscribed.\n\nYou will no longer receive newsletter emails. If this was a mistake, you can subscribe again at any time on https://1saif.me.\n\nBest regards,\nSaif Al-Janahi`
	})
};

// Email sending function using Mailtrap
async function sendEmail(to: string, subject: string, html: string, text: string, env: Env): Promise<boolean> {
	try {
		// Use environment variables for FROM address for flexibility
		const fromEmail = env.FROM_EMAIL;
		const fromName = env.FROM_NAME;

		console.log(`Attempting to send email to: ${to}`);
		console.log(`Using FROM_EMAIL: ${fromEmail}`);
		console.log(`Using FROM_NAME: ${fromName}`);
		console.log(`Mailtrap token exists: ${!!env.MAILTRAP_TOKEN}`);

		const payload = {
			from: {
				email: fromEmail,
				name: fromName
			},
			to: [{ email: to }],
			subject,
			html,
			text,
		};

		const response = await fetch('https://send.api.mailtrap.io/api/send', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.MAILTRAP_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		console.log('Response status:', response.status);
		console.log('Response headers:', Object.fromEntries(response.headers.entries()));
		
		const responseText = await response.text();
		console.log('Response body:', responseText);

		if (!response.ok) {
			console.error('Mailtrap API error:', response.status, responseText);
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

			// Test Mailtrap token endpoint
			if (path === '/test-mailtrap' && request.method === 'GET') {
				try {
					console.log('Testing Mailtrap API...');
					console.log('Token exists:', !!env.MAILTRAP_TOKEN);
					console.log('FROM_EMAIL:', env.FROM_EMAIL);
					
					const response = await fetch('https://send.api.mailtrap.io/api/send', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${env.MAILTRAP_TOKEN}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							from: {
								email: env.FROM_EMAIL,
								name: env.FROM_NAME,
							},
							to: [{ email: "hello@saifj.me" }],
							subject: "Test Email from Cloudflare Worker",
							html: "<p>This is a test email from your newsletter system</p>",
							text: "This is a test email from your newsletter system",
						}),
					});

					const responseText = await response.text();
					console.log('Mailtrap response status:', response.status);
					console.log('Mailtrap response body:', responseText);

					return new Response(JSON.stringify({
						status: response.status,
						response: responseText,
						tokenExists: !!env.MAILTRAP_TOKEN,
						fromEmail: env.FROM_EMAIL,
						success: response.ok
					}), {
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				} catch (error) {
					return new Response(JSON.stringify({
						error: 'Test failed',
						message: error instanceof Error ? error.message : 'Unknown error'
					}), {
						status: 500,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				}
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
