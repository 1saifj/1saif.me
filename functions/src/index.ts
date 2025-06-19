/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

import { onRequest, onCall } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

// Email templates are defined inline below

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Email configuration with Mailtrap
const createTransporter = () => {
  // Use sandbox for development, live for production
  const host = process.env.NODE_ENV === 'production' 
    ? "live.smtp.mailtrap.io" 
    : "sandbox.smtp.mailtrap.io";
    
  return nodemailer.createTransport({
    host,
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });
};

// Helper function to get website URLs
const getWebsiteUrl = (path: string = '') => {
  const domain = process.env.WEBSITE_DOMAIN || 'https://saifj.dev';
  return `${domain}${path}`;
};

// Helper function to get email sender info
const getEmailSender = () => {
  const name = process.env.FROM_NAME || 'Saif Al-Janahi';
  const email = process.env.FROM_EMAIL || 'noreply@saifj.dev';
  return `"${name}" <${email}>`;
};

// Email templates
const emailTemplates = {
  confirmation: (email: string, confirmationUrl: string) => ({
    subject: "Welcome! Please confirm your subscription 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; margin-top: 20px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🎉 Welcome to Our Newsletter!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
              Thanks for joining our community of tech enthusiasts
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 32px;">📧</span>
              </div>
              <h2 style="color: #2d3748; margin: 0 0 10px; font-size: 24px; font-weight: 600;">
                Almost there!
              </h2>
              <p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.6;">
                Please confirm your email address to start receiving our latest insights on software engineering, system design, and tech trends.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                ✅ Confirm Subscription
              </a>
            </div>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 18px; font-weight: 600;">
                What you'll get:
              </h3>
              <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>🚀 Latest software engineering insights</li>
                <li>🏗️ System design deep dives</li>
                <li>⚡ Performance optimization tips</li>
                <li>🔧 Real-world problem solutions</li>
              </ul>
            </div>
            
            <p style="color: #a0aec0; font-size: 14px; text-align: center; margin: 30px 0 0;">
              If you didn't sign up for this newsletter, you can safely ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              © 2024 Saif Al-Janahi | Software Engineer
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome! Please confirm your subscription by clicking: ${confirmationUrl}`
  }),

  welcome: (email: string, unsubscribeUrl: string) => ({
    subject: "🎉 Welcome to the newsletter family!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; margin-top: 20px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
              🎉 You're officially in!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
              Thanks for confirming your subscription
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #48bb78, #38a169); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 32px;">🚀</span>
              </div>
              <h2 style="color: #2d3748; margin: 0 0 15px; font-size: 24px; font-weight: 600;">
                Welcome aboard!
              </h2>
              <p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.6;">
                You'll now receive our latest insights on software engineering, system design, and cutting-edge tech trends directly in your inbox.
              </p>
            </div>
            
            <div style="background: #f7fafc; padding: 30px; border-radius: 12px; margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 20px; font-size: 20px; font-weight: 600;">
                What's coming next?
              </h3>
              <div style="text-align: left;">
                <div style="margin-bottom: 15px;">
                  <strong style="color: #4a5568;">📚 Technical Deep Dives:</strong>
                  <span style="color: #718096;"> In-depth explorations of complex engineering topics</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #4a5568;">💡 Best Practices:</strong>
                  <span style="color: #718096;"> Proven patterns and practices from real-world projects</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #4a5568;">🔧 Tool Reviews:</strong>
                  <span style="color: #718096;"> Honest reviews of the latest development tools</span>
                </div>
                <div>
                  <strong style="color: #4a5568;">📈 Career Insights:</strong>
                  <span style="color: #718096;"> Tips for growing as a software engineer</span>
                </div>
              </div>
            </div>
            
            <p style="color: #a0aec0; font-size: 14px; margin: 30px 0 0;">
              Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #667eea;">Unsubscribe here</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0; font-size: 14px;">
              © 2024 Saif Al-Janahi | Software Engineer
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to our newsletter! You'll receive great content about software engineering and tech trends.`
  }),

  unsubscribe: (email: string) => ({
    subject: "Sorry to see you go 👋",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f7fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <div style="padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 30px;">
              <span style="font-size: 48px;">👋</span>
            </div>
            <h2 style="color: #2d3748; margin: 0 0 15px; font-size: 24px; font-weight: 600;">
              You've been unsubscribed
            </h2>
            <p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.6;">
              We're sorry to see you go! If you ever change your mind, you're always welcome back.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `You've been unsubscribed. We're sorry to see you go!`
  })
};

// Trigger when a new subscriber is added (sends confirmation email)
export const onNewSubscriber = onDocumentCreated(
  "subscribers/{subscriberId}",
  async (event) => {
    const subscriber = event.data?.data();
    if (!subscriber || subscriber.status !== "pending") return;

    try {
      const transporter = createTransporter();
      const confirmationUrl = getWebsiteUrl(`/confirm-subscription?token=${subscriber.confirmationToken}`);
      const template = emailTemplates.confirmation(subscriber.email, confirmationUrl);

      await transporter.sendMail({
        from: getEmailSender(),
        to: subscriber.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info(`Confirmation email sent to ${subscriber.email}`);
    } catch (error) {
      logger.error("Error sending confirmation email:", error);
    }
  }
);

// Trigger when subscriber status changes to confirmed (sends welcome email)
export const onSubscriberConfirmed = onDocumentUpdated(
  "subscribers/{subscriberId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    
    if (!before || !after) return;
    if (before.status === "confirmed" || after.status !== "confirmed") return;

    try {
      const transporter = createTransporter();
      const unsubscribeUrl = getWebsiteUrl(`/unsubscribe?token=${after.unsubscribeToken}`);
      const template = emailTemplates.welcome(after.email, unsubscribeUrl);

      await transporter.sendMail({
        from: getEmailSender(),
        to: after.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info(`Welcome email sent to ${after.email}`);
    } catch (error) {
      logger.error("Error sending welcome email:", error);
    }
  }
);

// HTTP function to confirm subscription
export const confirmSubscription = onRequest(async (request, response) => {
  const { token } = request.query;
  
  if (!token) {
    response.status(400).send("Missing confirmation token");
    return;
  }

  try {
    const subscribersRef = db.collection("subscribers");
    const query = await subscribersRef.where("confirmationToken", "==", token).get();
    
    if (query.empty) {
      response.status(404).send("Invalid or expired confirmation token");
      return;
    }

    const doc = query.docs[0];
    const subscriber = doc.data();
    
    if (subscriber.status === "confirmed") {
      response.redirect(getWebsiteUrl("/already-confirmed"));
      return;
    }

    await doc.ref.update({
      status: "confirmed",
      confirmedAt: new Date(),
      confirmationToken: null, // Remove token for security
    });

    // Track analytics
    await db.collection("analytics").add({
      type: "subscription_confirmed",
      email: subscriber.email,
      timestamp: new Date(),
      source: subscriber.source || "unknown",
    });

    response.redirect(getWebsiteUrl("/subscription-confirmed"));
  } catch (error) {
    logger.error("Error confirming subscription:", error);
    response.status(500).send("Internal server error");
  }
});

// HTTP function to handle unsubscriptions
export const unsubscribe = onRequest(async (request, response) => {
  const { token } = request.query;
  
  if (!token) {
    response.status(400).send("Missing unsubscribe token");
    return;
  }

  try {
    const subscribersRef = db.collection("subscribers");
    const query = await subscribersRef.where("unsubscribeToken", "==", token).get();
    
    if (query.empty) {
      response.status(404).send("Invalid unsubscribe token");
      return;
    }

    const doc = query.docs[0];
    const subscriber = doc.data();

    if (subscriber.status === "unsubscribed") {
      response.redirect(getWebsiteUrl("/already-unsubscribed"));
      return;
    }

    await doc.ref.update({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    });

    // Send goodbye email
    const transporter = createTransporter();
    const template = emailTemplates.unsubscribe(subscriber.email);

    await transporter.sendMail({
      from: getEmailSender(),
      to: subscriber.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    // Track analytics
    await db.collection("analytics").add({
      type: "unsubscribed",
      email: subscriber.email,
      timestamp: new Date(),
      reason: request.body?.reason || "not_specified",
    });

    response.redirect(getWebsiteUrl("/unsubscribed"));
  } catch (error) {
    logger.error("Error processing unsubscription:", error);
    response.status(500).send("Internal server error");
  }
});

// Callable function to send newsletter to all confirmed subscribers
export const sendNewsletter = onCall(async (request) => {
  // Verify admin access (implement your own auth logic)
  const { subject, content, isTest = false } = request.data;
  
  if (!subject || !content) {
    throw new Error("Subject and content are required");
  }

  try {
    const transporter = createTransporter();
    const subscribersRef = db.collection("subscribers");
    const confirmedQuery = await subscribersRef.where("status", "==", "confirmed").get();
    
    if (confirmedQuery.empty) {
      return { success: true, message: "No confirmed subscribers found" };
    }

    const batchSize = 100; // Send in batches to avoid rate limits
    const subscribers = confirmedQuery.docs.map(doc => doc.data());
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    let totalSent = 0;
    let errors = 0;

    for (const batch of batches) {
      const promises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = getWebsiteUrl(`/unsubscribe?token=${subscriber.unsubscribeToken}`);
          
          await transporter.sendMail({
            from: getEmailSender(),
            to: subscriber.email,
            subject: isTest ? `[TEST] ${subject}` : subject,
            html: `
              ${content}
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #a0aec0; font-size: 12px; text-align: center;">
                <p>Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #667eea;">Unsubscribe here</a></p>
                <p>© 2024 ${process.env.FROM_NAME || 'Saif Al-Janahi'} | Software Engineer</p>
              </div>
            `,
          });
          totalSent++;
        } catch (error) {
          logger.error(`Error sending to ${subscriber.email}:`, error);
          errors++;
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Track newsletter analytics
    await db.collection("newsletters").add({
      subject,
      sentAt: new Date(),
      totalSent,
      errors,
      isTest,
    });

    return { 
      success: true, 
      message: `Newsletter sent to ${totalSent} subscribers${errors > 0 ? ` with ${errors} errors` : ''}` 
    };
  } catch (error) {
    logger.error("Error sending newsletter:", error);
    throw new Error("Failed to send newsletter");
  }
});

// Health check endpoint
export const healthCheck = onRequest((request, response) => {
  response.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});
