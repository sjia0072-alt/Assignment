import { httpsCallable } from 'firebase/functions';
import { functions, model } from './firebase';

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

/**
 * Improves email draft content and generates appropriate subject
 * @param {string} draftContent - The raw draft content
 * @param {string} currentSubject - Optional current subject to improve upon
 * @returns {Promise<{subject: string, message: string, error?: string}>}
 */
export async function improveEmailDraft(draftContent, currentSubject = '') {
  try {
    // Check if AI model is available
    if (!model) {
      throw new Error('AI service not available. Please check your Firebase AI configuration.');
    }

    if (!draftContent || draftContent.trim().length === 0) {
      throw new Error('Please provide some draft content to improve.');
    }

    // Create the prompt for email improvement
    const prompt = `You are a friendly and approachable email writer for customers (individual consumers). Please improve the following email draft to make it more friendly, clear, and engaging.

Draft content:
"${draftContent}"

${currentSubject ? `Current subject: "${currentSubject}"` : ""}

Guidelines:
1. Format the content into a friendly email structure with casual greetings, clear paragraphs, and warm closing
2. Generate an engaging and appealing subject line that captures attention
3. Use a conversational and warm tone - not too formal or corporate
4. Keep the core message and intent intact while making it more readable
5. Add appropriate emojis where suitable to make it more engaging
6. IMPORTANT: Match the email length to the original content - if the draft is short, keep the email concise. If it's detailed, you can expand appropriately.
7. End with a friendly call-to-action or warm closing

Note:
1. My team name is "Wellness360"
2. You shouldn't use placeholders or generic terms in the response.
3. Keep in mind that your response message will be directly used in the email!!
4. DO NOT use any placeholders or generic terms in the response. i.e. NO "[Recipient Name]"
5. DO NOT use any generic terms in the response. i.e. NO "[Link to Recommendations Portal]"
6. The email is sending to customers who have subscribed to our newsletter.
7. Feel free to use appropriate emojis to make the email more friendly and engaging 😊

Please respond in the following JSON format:
{
  "subject": "Generated subject line here",
  "message": "Complete improved email content here"
}`;

    // Generate content using AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    let improvedEmail;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        improvedEmail = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      console.warn('Failed to parse AI response as JSON:', parseError);
      improvedEmail = {
        subject: currentSubject || 'Improved Email Draft',
        message: text || draftContent
      };
    }

    // Validate the response
    if (!improvedEmail.subject || !improvedEmail.message) {
      throw new Error('AI response is incomplete. Please try again.');
    }

    return {
      subject: improvedEmail.subject.trim(),
      message: improvedEmail.message.trim()
    };

  } catch (error) {
    console.error('Error improving email draft:', error);

    let errorMessage = 'Failed to improve email draft';

    return {
      subject: '',
      message: '',
      error: errorMessage
    };
  }
}

export function isAIServiceAvailable() {
  return model !== null;
}
