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

/**
 * Helper function to verify admin privileges
 */
async function verifyAdmin(request) {
  if (!request.auth) {
    throw new Error("Authentication required");
  }

  const db = admin.firestore();
  const userDoc = await db.collection('users').where('email', '==', request.auth.token.email).get();

  if (userDoc.empty) {
    throw new Error("User not found");
  }

  const userData = userDoc.docs[0].data();
  if (userData.role !== 'admin') {
    throw new Error("Admin access required");
  }

  return { userData, db };
}

/**
 * Get all users from Firebase Authentication and Firestore
 * This is a callable function that can be called from the frontend
 */
exports.getAllUsers = onCall({
  region: 'us-central1',
  maxInstances: 5,
}, async (request) => {
  try {
    // Verify admin privileges
    const { db } = await verifyAdmin(request);

    // Get all users from Firebase Authentication
    const listUsersResult = await admin.auth().listUsers(1000);
    const authUsers = listUsersResult.users;

    // Get all users from Firestore
    const firestoreUsers = await db.collection('users').get();
    const firestoreUserData = {};

    // Create a map of email to Firestore data for quick lookup
    firestoreUsers.forEach(doc => {
      const data = doc.data();
      firestoreUserData[data.email] = {
        id: doc.id,
        ...data
      };
    });

    // Combine auth and firestore data
    const combinedUsers = authUsers.map(authUser => {
      const firestoreData = firestoreUserData[authUser.email] || {};

      return {
        uid: authUser.uid,
        email: authUser.email,
        phoneNumber: authUser.phoneNumber,
        emailVerified: authUser.emailVerified,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
        disabled: authUser.disabled,
        createdAt: authUser.metadata.creationTime,
        lastSignInAt: authUser.metadata.lastSignInTime,
        // Firestore data
        name: firestoreData.name || authUser.displayName || '',
        role: firestoreData.role || 'user',
        firestoreId: firestoreData.id || null,
        additionalData: firestoreData
      };
    });

    logger.info(`Retrieved ${combinedUsers.length} users`);

    return {
      success: true,
      users: combinedUsers,
      total: combinedUsers.length
    };

  } catch (error) {
    logger.error("Error getting users", { error: error.message });
    throw new Error(error.message || 'Failed to get users');
  }
});

/**
 * Update user information in Firestore and optionally Firebase Auth
 * This is a callable function that can be called from the frontend
 */
exports.updateUser = onCall({
  region: 'us-central1',
  maxInstances: 5,
}, async (request) => {
  try {
    // Verify admin privileges
    const { db } = await verifyAdmin(request);

    const { uid, updates } = request.data;

    // Validate required fields
    if (!uid) {
      throw new Error("User UID is required");
    }

    if (!updates || typeof updates !== 'object') {
      throw new Error("Update data is required");
    }

    // Get the user to find their email
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
    } catch (error) {
      throw new Error("User not found in Firebase Authentication");
    }

    let updateResults = {
      firestoreUpdated: false,
      authUpdated: false,
      errors: []
    };

    // Update Firestore user documents
    try {
      // 1. Try to update by UID as document ID
      const uidDocRef = db.collection('users').doc(uid);
      const uidDoc = await uidDocRef.get();

      if (uidDoc.exists) {
        await uidDocRef.update(updates);
        updateResults.firestoreUpdated = true;
        logger.info(`Updated Firestore document by UID: ${uid}`);
      } else {
        // 2. Try to find and update by email
        const emailQuery = await db.collection('users').where('email', '==', userRecord.email).get();

        if (!emailQuery.empty) {
          const updatePromises = emailQuery.docs.map(doc =>
            doc.ref.update(updates).then(() => ({ id: doc.id, success: true }))
          );
          const results = await Promise.all(updatePromises);
          updateResults.firestoreUpdated = true;
          logger.info(`Updated ${results.length} Firestore documents by email: ${userRecord.email}`);
        } else {
          updateResults.errors.push("No Firestore document found for this user");
        }
      }
    } catch (firestoreError) {
      updateResults.errors.push(`Firestore update error: ${firestoreError.message}`);
    }

    // Update Firebase Auth if displayName is provided
    if (updates.name && typeof updates.name === 'string') {
      try {
        await admin.auth().updateUser(uid, {
          displayName: updates.name.trim()
        });
        updateResults.authUpdated = true;
        logger.info(`Updated Firebase Auth displayName for user: ${uid}`);
      } catch (authError) {
        updateResults.errors.push(`Auth update error: ${authError.message}`);
      }
    }

    logger.info(`User update completed for UID: ${uid}`, updateResults);

    return {
      success: updateResults.firestoreUpdated || updateResults.authUpdated,
      message: `User updated. Firestore: ${updateResults.firestoreUpdated ? '✓' : '✗'}, Auth: ${updateResults.authUpdated ? '✓' : '✗'}`,
      updateResults
    };

  } catch (error) {
    logger.error("Error updating user", { error: error.message });
    throw new Error(error.message || 'Failed to update user');
  }
});

/**
 * Delete user from Firebase Authentication and Firestore
 * This is a callable function that can be called from the frontend
 */
exports.deleteUser = onCall({
  region: 'us-central1',
  maxInstances: 5,
}, async (request) => {
  try {
    // Verify admin privileges
    const { db } = await verifyAdmin(request);

    const { uid } = request.data;

    // Validate required fields
    if (!uid) {
      throw new Error("User UID is required");
    }

    // Get the user before deletion for logging
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
    } catch (error) {
      throw new Error("User not found in Firebase Authentication");
    }

    let deleteResults = {
      authDeleted: false,
      firestoreDeleted: false,
      deletedDocs: [],
      errors: []
    };

    // Delete from Firebase Authentication
    try {
      await admin.auth().deleteUser(uid);
      deleteResults.authDeleted = true;
      logger.info(`Deleted user from Firebase Auth: ${userRecord.email || uid}`);
    } catch (authError) {
      deleteResults.errors.push(`Auth deletion error: ${authError.message}`);
      throw new Error(`Failed to delete user from Authentication: ${authError.message}`);
    }

    // Delete from Firestore
    try {
      // 1. Try to delete by UID as document ID
      const uidDocRef = db.collection('users').doc(uid);
      const uidDoc = await uidDocRef.get();

      if (uidDoc.exists) {
        await uidDocRef.delete();
        deleteResults.firestoreDeleted = true;
        deleteResults.deletedDocs.push(uid);
        logger.info(`Deleted Firestore document by UID: ${uid}`);
      }

      // 2. Try to find and delete by email (registration method)
      const emailQuery = await db.collection('users').where('email', '==', userRecord.email).get();

      if (!emailQuery.empty) {
        const deletePromises = emailQuery.docs.map(doc =>
          doc.ref.delete().then(() => doc.id)
        );
        const deletedIds = await Promise.all(deletePromises);
        deleteResults.firestoreDeleted = true;
        deleteResults.deletedDocs.push(...deletedIds);
        logger.info(`Deleted ${deletedIds.length} Firestore documents by email: ${userRecord.email}`);
      }

      if (!deleteResults.firestoreDeleted) {
        deleteResults.errors.push("No Firestore documents found for this user");
      }
    } catch (firestoreError) {
      deleteResults.errors.push(`Firestore deletion error: ${firestoreError.message}`);
    }

    logger.info(`User deletion completed for: ${userRecord.email || uid}`, deleteResults);

    return {
      success: deleteResults.authDeleted,
      message: `User ${userRecord.email || uid} deleted successfully`,
      deletedUser: {
        uid: uid,
        email: userRecord.email,
        deletedDocs: deleteResults.deletedDocs
      },
      deleteResults
    };

  } catch (error) {
    logger.error("Error deleting user", { error: error.message });
    throw new Error(error.message || 'Failed to delete user');
  }
});
