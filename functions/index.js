/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// SendGrid configuration - use Firebase Secret Manager
const { defineSecret } = require('firebase-functions/params');

// Define secrets
const sendGridApiKey = defineSecret('SENDGRID_API_KEY');
const fromEmail = defineSecret('FROM_EMAIL');

// Set SendGrid API key will be done in the function with secrets

/**
 * Send email with attachments using SendGrid
 * This is a callable function that can be called from the frontend
 */
exports.sendEmailWithAttachments = onCall({
  // Set region and other options
  region: 'us-central1',
  maxInstances: 5,
  secrets: [sendGridApiKey, fromEmail],
}, async (request) => {
  try {
    // Verify user is authenticated and is admin
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    // Get user data from Firestore to verify admin role
    const db = admin.firestore();
    const userDoc = await db.collection('users').where('email', '==', request.auth.token.email).get();

    if (userDoc.empty) {
      throw new Error("User not found");
    }

    const userData = userDoc.docs[0].data();
    if (userData.role !== 'admin') {
      throw new Error("Admin access required");
    }

    // Extract email data from request
    const { to, subject, text, attachments } = request.data;

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error("Recipients are required");
    }

    if (!subject || !subject.trim()) {
      throw new Error("Subject is required");
    }

    if (!text || !text.trim()) {
      throw new Error("Message content is required");
    }

    // Prepare attachments for SendGrid
    const processedAttachments = [];

    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.filename && attachment.content) {
          processedAttachments.push({
            filename: attachment.filename,
            content: attachment.content,
            type: attachment.type || 'application/octet-stream',
            disposition: 'attachment'
          });
        }
      }
    }

    // Get secret values
    const SENDGRID_API_KEY = sendGridApiKey.value();
    const FROM_EMAIL = fromEmail.value();

    // Set SendGrid API key
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Create email message
    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: subject,
      text: text,
      html: text.replace(/\n/g, '<br>'), // Convert line breaks to HTML
      attachments: processedAttachments.length > 0 ? processedAttachments : undefined
    };

    // Send email using SendGrid
    const response = await sgMail.send(msg);

    logger.info("Email sent successfully", {
      recipients: to.length,
      subject: subject,
      messageId: response[0]?.headers?.['x-message-id']
    });

    return {
      success: true,
      message: `Email sent successfully to ${to.length} recipient(s)`,
      messageId: response[0]?.headers?.['x-message-id']
    };

  } catch (error) {
    logger.error("Error sending email", { error: error.message });

    // Handle SendGrid API errors
    if (error.response) {
      logger.error("SendGrid API error", error.response.body);
      throw new Error(`Email service error: ${error.response.body.errors?.[0]?.message || 'Unknown error'}`);
    }

    throw new Error(error.message || 'Failed to send email');
  }
});
