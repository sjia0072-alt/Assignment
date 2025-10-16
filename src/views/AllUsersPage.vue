<template>
  <section>
    <h1>Admin Dashboard</h1>

    <!-- Dashboard Statistics -->
    <div class="row m-4 justify-content-between">
      <div class="col-3 card bg-primary-subtle text-primary-emphasis flex-1">
        <div class="card-body d-flex justify-content-between">
          <h6 class="card-title mb-1">Total Users: {{ totalUsers }}</h6>
          <i class="pi pi-users text-4xl opacity-50"></i>
        </div>
      </div>

      <div class="col-3 card bg-danger-subtle text-danger-emphasis flex-1">
        <div class="card-body d-flex justify-content-between">
          <h6 class="card-title mb-1">Admin Users: {{ adminUsers }}</h6>
          <i class="pi pi-crown text-4xl opacity-50"></i>
        </div>
      </div>

      <div class="col-3 card bg-success-subtle text-success-emphasis flex-1">
        <div class="card-body d-flex justify-content-between">
          <h6 class="card-title mb-1">Regular Users: {{ regularUsers }}</h6>
          <i class="pi pi-user text-4xl opacity-50"></i>
        </div>
      </div>
    </div>

    <DataTable ref="dt" v-model:filters="filters" :value="formattedUsers" :paginator="true" :rows="10" :dataKey="'uid'"
      :loading="loading" :sortField="sortField" :sortOrder="sortOrder" filterDisplay="row" @sort="onSort($event)"
      aria-label="Users table with sorting and filtering" stripedRows responsiveLayout="scroll">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="m-0">User Management</h5>
          <div class="d-flex gap-2">
            <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />
            <Button icon="pi pi-refresh" label="Refresh" class="p-button-outlined" @click="loadUsers" :loading="loading"
              aria-label="Refresh users list" />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4">
          <i class="pi pi-users text-4xl text-muted mb-3"></i>
          <p class="text-muted">No users found.</p>
          <Button label="Try Again" icon="pi pi-replay" class="p-button-outlined mt-2" @click="loadUsers" />
        </div>
      </template>

      <template #loading>
        <div class="text-center p-4">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
          <p class="mt-3">Loading users from Firebase...</p>
        </div>
      </template>

      <Column field="name" header="Name" style="min-width: 12rem" sortable filter>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <Avatar :label="data.name.charAt(0).toUpperCase()" class="me-2" size="small"
              :style="{ backgroundColor: getAvatarColor(data.name) }" />
            <span>{{ data.name || 'Unknown' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by name" />
        </template>
      </Column>

      <Column field="email" header="Email" style="min-width: 14rem" sortable filter>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-envelope me-2 text-muted" :class="{ 'text-green-500': data.emailVerified }"></i>
            <span :class="{ 'text-green-600': data.emailVerified }">{{ data.email || 'N/A' }}</span>
            <i v-if="data.emailVerified" class="pi pi-check-circle ml-2 text-green-500" title="Email verified"></i>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by email" />
        </template>
      </Column>

      <Column field="role" header="Role" style="min-width: 10rem" sortable filter>
        <template #body="{ data }">
          <Tag :value="data.role?.trim() || 'Unknown'" :severity="getRoleSeverity(data.role?.trim())"
            :icon="getRoleIcon(data.role?.trim())" rounded />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown v-model="filterModel.value" :options="roleOptions" placeholder="Select a Role" showClear
            @change="filterCallback()" />
        </template>
      </Column>

      <Column field="lastSignInAt" header="Last Login" style="min-width: 12rem" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-clock me-2 text-muted"></i>
            <span>{{ data.lastSignInAt }}</span>
          </div>
        </template>
      </Column>

      <Column header="Actions" :exportable="false" style="min-width: 10rem">
        <template #body="{ data }">
          <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info mr-1" @click="viewUser(data)"
            v-tooltip="'View user details'" aria-label="View user details" />
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning mr-1"
            @click="editUser(data)" v-tooltip="'Edit user'" aria-label="Edit user" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
            @click="confirmDeleteUser(data)" v-tooltip="'Delete user'" aria-label="Delete user" />
        </template>
      </Column>
    </DataTable>

    <!-- User Details Modal -->
    <Dialog v-model:visible="userDetailsVisible" :style="{ width: '600px' }" header="User Details" :modal="true">
      <div v-if="selectedUser" class="p-0">
        <!-- User Header -->
        <div class="text-center mb-4 p-3 bg-gray-50 border-round">
          <Avatar :label="selectedUser.name.charAt(0).toUpperCase()" size="xlarge" class="mb-3"
            :style="{ backgroundColor: getAvatarColor(selectedUser.name), width: '60px', height: '60px', fontSize: '1.5rem' }" />
          <h4 class="m-0 mb-1">{{ selectedUser.name || 'Unknown' }}</h4>
          <Tag :value="selectedUser.role?.trim() || 'Unknown'" :severity="getRoleSeverity(selectedUser.role?.trim())"
            :icon="getRoleIcon(selectedUser.role?.trim())" rounded />
        </div>

        <!-- User Information -->
        <div class="row">
          <div class="col-5">
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-600 font-medium">Email</span>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-600 font-medium">Phone</span>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-600 font-medium">Account Status</span>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-600 font-medium">Created</span>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-600 font-medium">Last Login</span>
            </div>
            <div class="p-2">
              <span class="text-600 font-medium">User ID</span>
            </div>
          </div>

          <div class="col-7">
            <div class="p-2 border-bottom-1 border-gray-200">
              <div class="flex align-items-center gap-2">
                <span :class="{ 'text-green-600': selectedUser.emailVerified }">{{ selectedUser.email || 'N/A' }}</span>
                <i v-if="selectedUser.emailVerified" class="pi pi-check-circle text-green-500"
                  title="Email verified"></i>
              </div>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span>{{ selectedUser.phoneNumber || 'Not set' }}</span>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <Tag
                :value="selectedUser.disabled ? 'Disabled' : (selectedUser.emailVerified ? 'Verified' : 'Unverified')"
                :severity="selectedUser.disabled ? 'danger' : (selectedUser.emailVerified ? 'success' : 'warning')"
                :icon="selectedUser.disabled ? 'pi pi-ban' : (selectedUser.emailVerified ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle')"
                rounded />
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-sm">{{ selectedUser.createdAt }}</span>
            </div>
            <div class="p-2 border-bottom-1 border-gray-200">
              <span class="text-sm">{{ selectedUser.lastSignInAt }}</span>
            </div>
            <div class="p-2">
              <span class="text-xs text-500" style="word-break: break-all;">{{ selectedUser.uid }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="userDetailsVisible = false" />
      </template>
    </Dialog>

    <!-- Edit User Modal -->
    <Dialog v-model:visible="editUserVisible" :style="{ width: '450px' }" header="Edit User" :modal="true">
      <div v-if="editingUser" class="p-fluid">
        <div class="field my-2">
          <div class="row align-items-center">
            <label class="col-3 text-center" for="edit-name">Name</label>
            <InputText class="col-9" id="edit-name" v-model="editingUser.name"
              :class="{ 'p-invalid': editErrors.name }" />
          </div>
          <small v-if="editErrors.name" class="p-error">{{ editErrors.name }}</small>
        </div>
        <div class="field my-2">
          <div class="row align-items-center">
            <label class="col-3 text-center" for="edit-email">Email</label>
            <InputText class="col-9" id="edit-email" v-model="editingUser.email" readonly disabled />
          </div>
        </div>
        <div class="field my-2">
          <div class="row align-items-center">
            <label class="col-3 text-center" for="edit-role">Role</label>
            <Dropdown class="col-9" id="edit-role" v-model="editingUser.role" :options="['user', 'admin']"
              :class="{ 'p-invalid': editErrors.role }" />
          </div>
          <small v-if="editErrors.role" class="p-error">{{ editErrors.role }}</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelEditUser" />
        <Button label="Save" icon="pi pi-check" class="p-button-warning" @click="saveUser" :loading="saveLoading" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteUserVisible" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
      <div v-if="deletingUser" class="p-fluid">
        <div class="text-center mb-4">
          <i class="pi pi-exclamation-triangle text-5xl text-yellow-500"></i>
        </div>
        <p class="text-center">
          Are you sure you want to delete the following user?
        </p>
        <div class="p-3 bg-gray-100 border-round">
          <p><strong>Name:</strong> {{ deletingUser.name }}</p>
          <p><strong>Email:</strong> {{ deletingUser.email }}</p>
          <p><strong>Role:</strong> {{ deletingUser.role }}</p>
        </div>
        <p class="text-center mt-3 text-red-600">
          <strong>This action cannot be undone!</strong>
        </p>
        <div class="field mt-4">
          <label for="confirm-delete">Type "DELETE" to confirm:</label>
          <InputText id="confirm-delete" v-model="deleteConfirmation" placeholder="Type DELETE" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelDeleteUser" />
        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteUser"
          :disabled="deleteConfirmation !== 'DELETE'" :loading="deleteLoading" />
      </template>
    </Dialog>
  </section>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { getAllUsers, updateUser, deleteUser as deleteUserFromFirebase, formatUserData, validateUserUpdate } from '@/service/userManagementService';

const toast = useToast();
const users = ref([]);
const loading = ref(true);
const sortField = ref('name');
const sortOrder = ref(1);
const dt = ref();

// Modal visibility states
const userDetailsVisible = ref(false);
const editUserVisible = ref(false);
const deleteUserVisible = ref(false);

// Selected user for different modals
const selectedUser = ref(null);
const editingUser = ref(null);
const deletingUser = ref(null);

// Loading states
const saveLoading = ref(false);
const deleteLoading = ref(false);

// Form validation errors
const editErrors = ref({});

// Delete confirmation
const deleteConfirmation = ref('');

// Computed property for formatted users
const formattedUsers = computed(() => {
  return users.value.map(user => formatUserData(user));
});

// Computed properties for statistics
const totalUsers = computed(() => users.value.length);

const adminUsers = computed(() => {
  return users.value.filter(user => user.role === 'admin').length;
});

const regularUsers = computed(() => {
  return users.value.filter(user => user.role === 'user').length;
});

// Filters for DataTable
const filters = ref({
  name: { value: null },
  email: { value: null },
  role: { value: null }
});

// Role options for filter dropdown
const roleOptions = ref(['admin', 'user']);

function getRoleSeverity(role) {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'danger';
    case 'user':
      return 'success';
    case 'guest':
      return 'info';
    default:
      return 'secondary';
  }
}

function getRoleIcon(role) {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'pi pi-crown';
    case 'user':
      return 'pi pi-user';
    case 'guest':
      return 'pi pi-user-plus';
    default:
      return 'pi pi-question';
  }
}

function getAvatarColor(name) {
  const colors = [
    '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0',
    '#00BCD4', '#CDDC39', '#FFC107', '#795548', '#607D8B'
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

function onSort(event) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
}

const exportCSV = () => {
  dt.value.exportCSV();
};

// Load users from Firebase
async function loadUsers() {
  try {
    loading.value = true;
    const result = await getAllUsers();

    if (result.success) {
      users.value = result.data.users || [];
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Loaded ${users.value.length} users`,
        life: 3000
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load users data',
      life: 5000
    });
    users.value = [];
  } finally {
    loading.value = false;
  }
}

// View user details
function viewUser(user) {
  selectedUser.value = user;
  userDetailsVisible.value = true;
}

// Edit user
function editUser(user) {
  editingUser.value = { ...user };
  editErrors.value = {};
  editUserVisible.value = true;
}

// Cancel edit
function cancelEditUser() {
  editingUser.value = null;
  editErrors.value = {};
  editUserVisible.value = false;
}

// Save user changes
async function saveUser() {
  if (!editingUser.value) return;

  try {
    // Validate updates
    const updates = {
      name: editingUser.value.name,
      role: editingUser.value.role,
      disabled: editingUser.value.disabled
    };

    const validation = validateUserUpdate(updates);
    if (!validation.isValid) {
      editErrors.value = {};
      validation.errors.forEach(error => {
        if (error.includes('Name')) editErrors.value.name = error;
        if (error.includes('Role')) editErrors.value.role = error;
      });
      return;
    }

    saveLoading.value = true;

    const result = await updateUser(editingUser.value.uid, validation.validUpdates);

    if (result.success) {
      // Update local user data
      const userIndex = users.value.findIndex(u => u.uid === editingUser.value.uid);
      if (userIndex !== -1) {
        users.value[userIndex] = { ...users.value[userIndex], ...validation.validUpdates };
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `User ${editingUser.value.name} updated successfully`,
        life: 3000
      });

      editUserVisible.value = false;
      editingUser.value = null;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to update user:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update user',
      life: 5000
    });
  } finally {
    saveLoading.value = false;
  }
}

// Confirm delete user
function confirmDeleteUser(user) {
  deletingUser.value = user;
  deleteConfirmation.value = '';
  deleteUserVisible.value = true;
}

// Cancel delete
function cancelDeleteUser() {
  deletingUser.value = null;
  deleteConfirmation.value = '';
  deleteUserVisible.value = false;
}

// Delete user
async function deleteUser() {
  if (!deletingUser.value) return;

  try {
    deleteLoading.value = true;

    const result = await deleteUserFromFirebase(deletingUser.value.uid);

    if (result.success) {
      // Remove from local user data
      const userIndex = users.value.findIndex(u => u.uid === deletingUser.value.uid);
      if (userIndex !== -1) {
        users.value.splice(userIndex, 1);
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `User ${deletingUser.value.name} deleted successfully`,
        life: 3000
      });

      deleteUserVisible.value = false;
      deletingUser.value = null;
      deleteConfirmation.value = '';
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete user',
      life: 5000
    });
  } finally {
    deleteLoading.value = false;
  }
}

// Load users on component mount
onMounted(() => {
  loadUsers();
});
</script>
