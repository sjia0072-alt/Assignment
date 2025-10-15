import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Send email with attachments using Firebase Cloud Function
 * @param {Object} emailData - Email data object
 * @param {Array} emailData.to - Array of recipient email addresses
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text email content
 * @param {Array} emailData.attachments - Array of attachment objects
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendEmailWithAttachments(emailData) {
  try {
    // Get reference to the callable function
    const sendEmailFunction = httpsCallable(functions, 'sendEmailWithAttachments');

    // Convert files to base64 for transmission
    const processedAttachments = [];

    if (emailData.attachments && Array.isArray(emailData.attachments)) {
      for (const attachment of emailData.attachments) {
        if (attachment.content && attachment.filename) {
          const base64Content = await fileToBase64(attachment.content);

          processedAttachments.push({
            filename: attachment.filename,
            content: base64Content,
            type: attachment.content.type || 'application/octet-stream'
          });
        }
      }
    }

    // Prepare data for Cloud Function
    const functionData = {
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      attachments: processedAttachments.length > 0 ? processedAttachments : undefined
    };

    // Call the Cloud Function
    const result = await sendEmailFunction(functionData);

    console.log('Email sent successfully:', result.data);
    return result.data;

  } catch (error) {
    console.error('Error sending email:', error);

    // Provide specific error messages based on Firebase Functions error codes
    if (error.code === 'unauthenticated') {
      throw new Error('Authentication required. Please sign in again.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Admin access required. Only administrators can send emails.');
    } else if (error.code === 'internal') {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'deadline-exceeded') {
      throw new Error('Request timed out. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to send email');
    }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export async function sendSimpleEmail(to, subject, text) {
  return sendEmailWithAttachments({
    to: Array.isArray(to) ? to : [to],
    subject,
    text
  });
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAttachmentFile(file) {
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File ${file.name} exceeds 5MB size limit`
    };
  }

  return {
    isValid: true,
    message: 'File is valid'
  };
}
