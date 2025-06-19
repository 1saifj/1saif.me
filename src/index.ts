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

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Email templates
const emailTemplates = {
  confirmation: (email: string, confirmationUrl: string) => ({
    subject: '📧 Please confirm your subscription',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome! 🎉</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Please confirm your subscription to get started</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 22px;">Hi there!</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Thanks for subscribing to my newsletter! I'm excited to share insights about software engineering, 
              tech trends, and creative projects with you.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; transition: transform 0.2s;">
                ✅ Confirm Subscription
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              © 2024 Saif Al-Janahi | Software Engineer<br>
              If you didn't sign up for this newsletter, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome! Please confirm your subscription.

Thanks for subscribing to my newsletter! Please click the link below to confirm your subscription:

${confirmationUrl}

If you didn't sign up for this newsletter, you can safely ignore this email.

© 2024 Saif Al-Janahi | Software Engineer
    `
  }),

  welcome: (email: string, unsubscribeUrl: string) => ({
    subject: '🎉 Welcome to my newsletter!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">You're In! 🚀</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your subscription is confirmed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 22px;">Welcome aboard! 🎉</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Thanks for confirming your subscription! You'll now receive my latest insights on:
            </p>
            
            <div style="background: #f7fafc; padding: 25px; border-radius: 12px; margin: 30px 0;">
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>🔧 Software Engineering Best Practices</li>
                <li>💡 Tech Industry Insights & Trends</li>
                <li>🚀 Creative Projects & Side Hustles</li>
                <li>📚 Learning Resources & Tutorials</li>
              </ul>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
              I promise to keep it valuable and not spam your inbox. You can expect quality content 
              delivered right when it matters most.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              © 2024 Saif Al-Janahi | Software Engineer<br>
              Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #667eea;">Unsubscribe here</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome aboard!

Thanks for confirming your subscription! You'll now receive my latest insights on:

• Software Engineering Best Practices
• Tech Industry Insights & Trends  
• Creative Projects & Side Hustles
• Learning Resources & Tutorials

I promise to keep it valuable and not spam your inbox.

Don't want to receive these emails? Unsubscribe here: ${unsubscribeUrl}

© 2024 Saif Al-Janahi | Software Engineer
    `
  }),

  unsubscribe: (email: string) => ({
    subject: '👋 Sorry to see you go',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Goodbye</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Goodbye for now 👋</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">You've been unsubscribed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 22px;">Sorry to see you go! 😔</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              You've been successfully unsubscribed from my newsletter. If this was a mistake, 
              feel free to subscribe again anytime at my website.
            </p>
            
            <div style="background: #f7fafc; padding: 25px; border-radius: 12px; margin: 30px 0;">
              <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">Quick feedback (optional):</p>
              <p style="color: #718096; font-size: 14px; margin: 0;">
                Was the content not relevant? Too frequent? Let me know what I could improve for future subscribers.
              </p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Thanks for being part of the journey, and I hope our paths cross again soon! 🚀
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              © 2024 Saif Al-Janahi | Software Engineer
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Sorry to see you go!

You've been successfully unsubscribed from my newsletter. If this was a mistake, feel free to subscribe again anytime at my website.

Thanks for being part of the journey, and I hope our paths cross again soon!

© 2024 Saif Al-Janahi | Software Engineer
    `
  })
};

// Helper function to create Mailtrap transporter config
function getMailtrapConfig(env: Env) {
  return {
    host: env.FROM_EMAIL?.includes('1saif.me') ? 'live.smtp.mailtrap.io' : 'sandbox.smtp.mailtrap.io',
    port: 587,
    auth: {
      user: env.MAILTRAP_USERNAME,
      pass: env.MAILTRAP_PASSWORD,
    },
  };
}

// Helper function to send email via Mailtrap
async function sendEmail(env: Env, { to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const config = getMailtrapConfig(env);
  
  const emailData = {
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  };

  // Using fetch to send email via Mailtrap API (more reliable than SMTP in Workers)
  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Token': env.MAILTRAP_PASSWORD, // Use API token for better reliability
    },
    body: JSON.stringify({
      from: { email: env.FROM_EMAIL, name: env.FROM_NAME },
      to: [{ email: to }],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

// Helper function to update Firestore document
async function updateFirestoreDocument(env: Env, collection: string, docId: string, data: any) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.FIREBASE_API_KEY}`,
    },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === 'string' ? { stringValue: value } :
          typeof value === 'boolean' ? { booleanValue: value } :
          value instanceof Date ? { timestampValue: value.toISOString() } :
          { stringValue: String(value) }
        ])
      )
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update Firestore: ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to query Firestore
async function queryFirestore(env: Env, collection: string, field: string, operator: string, value: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.FIREBASE_API_KEY}`,
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: operator,
            value: { stringValue: value }
          }
        }
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to query Firestore: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result || [];
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: Send confirmation email
      if (path === '/send-confirmation' && request.method === 'POST') {
        const { email, confirmationToken } = await request.json();
        
        const confirmationUrl = `${env.WEBSITE_DOMAIN}/confirm-subscription?token=${confirmationToken}`;
        const template = emailTemplates.confirmation(email, confirmationUrl);
        
        await sendEmail(env, {
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        return new Response(JSON.stringify({ success: true, message: 'Confirmation email sent' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Send welcome email
      if (path === '/send-welcome' && request.method === 'POST') {
        const { email, unsubscribeToken } = await request.json();
        
        const unsubscribeUrl = `${env.WEBSITE_DOMAIN}/unsubscribe?token=${unsubscribeToken}`;
        const template = emailTemplates.welcome(email, unsubscribeUrl);
        
        await sendEmail(env, {
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        return new Response(JSON.stringify({ success: true, message: 'Welcome email sent' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Handle subscription confirmation
      if (path === '/confirm-subscription' && request.method === 'GET') {
        const token = url.searchParams.get('token');
        
        if (!token) {
          return new Response('Missing confirmation token', { status: 400, headers: corsHeaders });
        }

        // Query Firestore for subscriber with this token
        const results = await queryFirestore(env, 'subscribers', 'confirmationToken', 'EQUAL', token);
        
        if (results.length === 0) {
          return new Response('Invalid or expired confirmation token', { status: 404, headers: corsHeaders });
        }

        const doc = results[0];
        const subscriber = doc.document.fields;
        const docId = doc.document.name.split('/').pop();

        if (subscriber.status?.stringValue === 'confirmed') {
          return Response.redirect(`${env.WEBSITE_DOMAIN}/already-confirmed`, 302);
        }

        // Update subscriber status
        await updateFirestoreDocument(env, 'subscribers', docId, {
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmationToken: null,
        });

        // Send welcome email
        const unsubscribeUrl = `${env.WEBSITE_DOMAIN}/unsubscribe?token=${subscriber.unsubscribeToken?.stringValue}`;
        const template = emailTemplates.welcome(subscriber.email?.stringValue, unsubscribeUrl);
        
        await sendEmail(env, {
          to: subscriber.email?.stringValue,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        return Response.redirect(`${env.WEBSITE_DOMAIN}/subscription-confirmed`, 302);
      }

      // Route: Handle unsubscription
      if (path === '/unsubscribe' && request.method === 'GET') {
        const token = url.searchParams.get('token');
        
        if (!token) {
          return new Response('Missing unsubscribe token', { status: 400, headers: corsHeaders });
        }

        // Query Firestore for subscriber with this token
        const results = await queryFirestore(env, 'subscribers', 'unsubscribeToken', 'EQUAL', token);
        
        if (results.length === 0) {
          return new Response('Invalid unsubscribe token', { status: 404, headers: corsHeaders });
        }

        const doc = results[0];
        const subscriber = doc.document.fields;
        const docId = doc.document.name.split('/').pop();

        if (subscriber.status?.stringValue === 'unsubscribed') {
          return Response.redirect(`${env.WEBSITE_DOMAIN}/already-unsubscribed`, 302);
        }

        // Update subscriber status
        await updateFirestoreDocument(env, 'subscribers', docId, {
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
        });

        // Send goodbye email
        const template = emailTemplates.unsubscribe(subscriber.email?.stringValue);
        
        await sendEmail(env, {
          to: subscriber.email?.stringValue,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        return Response.redirect(`${env.WEBSITE_DOMAIN}/unsubscribed`, 302);
      }

      // Route: Send newsletter to all confirmed subscribers
      if (path === '/send-newsletter' && request.method === 'POST') {
        const { subject, content, isTest = false } = await request.json();
        
        if (!subject || !content) {
          return new Response(JSON.stringify({ error: 'Subject and content are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Query all confirmed subscribers
        const results = await queryFirestore(env, 'subscribers', 'status', 'EQUAL', 'confirmed');
        
        if (results.length === 0) {
          return new Response(JSON.stringify({ success: true, message: 'No confirmed subscribers found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let totalSent = 0;
        let errors = 0;

        // Send emails in batches
        for (const result of results) {
          try {
            const subscriber = result.document.fields;
            const email = subscriber.email?.stringValue;
            const unsubscribeUrl = `${env.WEBSITE_DOMAIN}/unsubscribe?token=${subscriber.unsubscribeToken?.stringValue}`;
            
            await sendEmail(env, {
              to: email,
              subject: isTest ? `[TEST] ${subject}` : subject,
              html: `
                ${content}
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #a0aec0; font-size: 12px; text-align: center;">
                  <p>Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #667eea;">Unsubscribe here</a></p>
                  <p>© 2024 ${env.FROM_NAME} | Software Engineer</p>
                </div>
              `,
              text: `${content}\n\nUnsubscribe: ${unsubscribeUrl}\n© 2024 ${env.FROM_NAME}`,
            });
            
            totalSent++;
          } catch (error) {
            console.error('Error sending to', subscriber.email?.stringValue, ':', error);
            errors++;
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Newsletter sent to ${totalSent} subscribers${errors > 0 ? ` (${errors} errors)` : ''}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          service: 'Newsletter Email Service'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Default route
      return new Response(JSON.stringify({ 
        message: 'Newsletter Email Service',
        endpoints: [
          'POST /send-confirmation',
          'POST /send-welcome', 
          'GET /confirm-subscription?token=...',
          'GET /unsubscribe?token=...',
          'POST /send-newsletter',
          'GET /health'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
}; 