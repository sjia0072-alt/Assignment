<template>
  <section class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h2 class="mb-0">
              <i class="pi pi-envelope me-2" aria-hidden="true"></i>
              Email Broadcast
            </h2>
            <p class="mb-0 mt-2 opacity-75">Send emails to multiple users with attachments</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="sendEmail" aria-label="Email broadcast form">
              <!-- Subject -->
              <div class="mb-3">
                <label for="subject" class="form-label fw-bold">Subject</label>
                <input v-model="emailData.subject" type="text" class="form-control" id="subject"
                  placeholder="Enter email subject" required aria-required="true" aria-describedby="subject-help" />
                <div id="subject-help" class="form-text">
                  Enter a clear and descriptive subject line for your email
                </div>
              </div>

              <!-- Message -->
              <div class="mb-3">
                <label for="message" class="form-label fw-bold">Message</label>
                <textarea v-model="emailData.message" class="form-control" id="message" rows="8"
                  placeholder="Type your message here..." required aria-required="true"
                  aria-describedby="message-help"></textarea>
                <div id="message-help" class="form-text">
                  Write the content of your email message here
                </div>
              </div>

              <!-- User Selection -->
              <div class="mb-3">
                <fieldset class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                  <legend class="form-label fw-bold mb-3">Select Users</legend>
                  <div class="form-check mb-2" v-for="user in users" :key="user.id">
                    <input class="form-check-input" type="checkbox" :value="user.email" v-model="emailData.recipients"
                      :id="'user-' + user.id" :aria-describedby="'user-help-' + user.id" />
                    <label class="form-check-label d-flex align-items-center" :for="'user-' + user.id">
                      <span class="badge bg-secondary me-2">{{ user.role }}</span>
                      <span class="me-2">{{ user.name }}</span>
                      <span class="text-muted">- {{ user.email }}</span>
                    </label>
                    <div :id="'user-help-' + user.id" class="form-text">
                      Send email to {{ user.name }} at {{ user.email }}
                    </div>
                  </div>
                </fieldset>
                <div class="mt-2" role="status" aria-live="polite">
                  <span class="form-text">
                    <strong>{{ emailData.recipients.length }}</strong> user(s) selected
                  </span>
                </div>
              </div>

              <!-- Attachments -->
              <div class="mb-3">
                <label for="attachments" class="form-label fw-bold">Attachments</label>
                <input type="file" class="form-control" id="attachments" multiple @change="handleFileChange"
                  aria-describedby="attachments-help" />
                <div id="attachments-help" class="form-text">
                  Each file must be less than 5MB.
                </div>
              </div>

              <!-- Selected Files -->
              <div v-if="selectedFiles.length > 0" class="mb-3">
                <h3 class="form-label fw-bold">Selected Files</h3>
                <ul class="list-group" role="list" aria-label="Selected attachments">
                  <li v-for="(file, index) in selectedFiles" :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center" role="listitem">
                    <span class="d-flex align-items-center">
                      <i class="pi pi-paperclip me-2" aria-hidden="true"></i>
                      <span>{{ file.name }}</span>
                      <span class="text-muted ms-2">({{ formatFileSize(file.size) }})</span>
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile(index)"
                      :aria-label="'Remove file ' + file.name">
                      <i class="pi pi-times" aria-hidden="true"></i>
                      <span class="visually-hidden">Remove {{ file.name }}</span>
                    </button>
                  </li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-wrap gap-2" role="group" aria-label="Email actions">
                <button type="submit" class="btn btn-primary" :disabled="isSending || emailData.recipients.length === 0"
                  :aria-label="isSending ? 'Sending email, please wait' : 'Send email to selected recipients'">
                  <i v-if="isSending" class="pi pi-spin pi-spinner me-2" aria-hidden="true"></i>
                  <i v-else class="pi pi-send me-2" aria-hidden="true"></i>
                  {{ isSending ? 'Sending...' : 'Send Email' }}
                </button>
                <button type="button" class="btn btn-secondary" @click="clearForm" :disabled="isSending"
                  aria-label="Clear all form fields">
                  <i class="pi pi-refresh me-2" aria-hidden="true"></i>
                  Clear
                </button>
                <button type="button" class="btn btn-info text-white" @click="selectAllUsers" :disabled="isSending"
                  aria-label="Select all users in the list">
                  <i class="pi pi-check-square me-2" aria-hidden="true"></i>
                  Select All
                </button>
                <button type="button" class="btn btn-warning text-white" @click="deselectAllUsers" :disabled="isSending"
                  aria-label="Deselect all users in the list">
                  <i class="pi pi-square me-2" aria-hidden="true"></i>
                  Deselect All
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { loadAll } from '@/service/store';
import { sendEmailWithAttachments } from '@/service/emailService';

const toast = useToast();

// Form data
const emailData = ref({
  subject: '',
  message: '',
  recipients: []
});

// Component state
const users = ref([]);
const selectedFiles = ref([]);
const isSending = ref(false);

// Load users for selection
onMounted(async () => {
  try {
    const loadedUsers = await loadAll('users');

    users.value = loadedUsers;
  } catch (error) {
    console.error('Failed to load users:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users for email selection',
      life: 3000
    });
  }
});

// Handle file selection
function handleFileChange(event) {
  const files = Array.from(event.target.files);

  // Check file sizes (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      toast.add({
        severity: 'warn',
        summary: 'File Too Large',
        detail: `${file.name} exceeds 5MB limit`,
        life: 3000
      });
      return false;
    }
    return true;
  });

  selectedFiles.value = [...selectedFiles.value, ...validFiles];
}

// Remove file from selection
function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Select all users
function selectAllUsers() {
  emailData.value.recipients = users.value.map(user => user.email);
}

// Deselect all users
function deselectAllUsers() {
  emailData.value.recipients = [];
}

// Clear form
function clearForm() {
  emailData.value = {
    subject: '',
    message: '',
    recipients: []
  };
  selectedFiles.value = [];
  const fileInput = document.getElementById('attachments');
  if (fileInput) {
    fileInput.value = '';
  }
}

// Send email function
async function sendEmail() {
  if (emailData.value.recipients.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'No Recipients',
      detail: 'Please select at least one recipient',
      life: 3000
    });
    return;
  }

  if (!emailData.value.subject.trim() || !emailData.value.message.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please fill in both subject and message',
      life: 3000
    });
    return;
  }

  try {
    isSending.value = true;

    // Prepare email data
    const emailPayload = {
      to: emailData.value.recipients,
      subject: emailData.value.subject,
      text: emailData.value.message,
      attachments: selectedFiles.value.map(file => ({
        filename: file.name,
        content: file
      }))
    };

    // Send email using the service
    const result = await sendEmailWithAttachments(emailPayload);

    // Clear form after successful send
    clearForm();

    toast.add({
      severity: 'success',
      summary: 'Email Sent',
      detail: result.message || `Email sent to ${emailData.value.recipients.length} recipient(s)`,
      life: 5000
    });

  } catch (error) {
    console.error('Error sending email:', error);
    toast.add({
      severity: 'error',
      summary: 'Send Failed',
      detail: error.message || 'Failed to send email',
      life: 5000
    });
  } finally {
    isSending.value = false;
  }
}
</script>
