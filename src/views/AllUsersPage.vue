<template>
  <section>
    <h1>All Users</h1>
    <DataTable v-model:filters="filters" :value="users" :paginator="true" :rows="10" :dataKey="id" :loading="loading"
      :sortField="sortField" :sortOrder="sortOrder" filterDisplay="row"
      @sort="onSort($event)" aria-label="Users table with sorting and filtering" stripedRows responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-start align-items-center">
          <h5 class="m-0">User Management</h5>
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4">
          <i class="pi pi-users text-4xl text-muted mb-3"></i>
          <p class="text-muted">No users found.</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center p-4">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
          <p class="mt-3">Loading users...</p>
        </div>
      </template>

      <Column field="name" header="Name" style="min-width: 12rem" sortable filter>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-user mr-2 text-primary"></i>
            <span>{{ data.name || 'N/A' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by name" />
        </template>
      </Column>

      <Column field="email" header="Email" style="min-width: 12rem" sortable filter>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-envelope mr-2 text-muted"></i>
            <span>{{ data.email || 'N/A' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by email" />
        </template>
      </Column>

      <Column field="role" header="Role" style="min-width: 12rem" sortable filter>
        <template #body="{ data }">
          <Tag :value="data.role?.trim() || 'Unknown'" :severity="getRoleSeverity(data.role?.trim())" :icon="getRoleIcon(data.role?.trim())"
            rounded />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown v-model="filterModel.value" :options="roleOptions" placeholder="Select a Role"
            showClear @change="filterCallback()" />
        </template>
      </Column>

      <Column header="Actions" :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info mr-2" @click="viewUser(data)"
            aria-label="View user details" />
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning mr-2"
            @click="editUser(data)" aria-label="Edit user" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
            @click="confirmDeleteUser(data)" aria-label="Delete user" />
        </template>
      </Column>
    </DataTable>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { loadAll } from '@/service/store';

const toast = useToast();
const users = ref([]);
const loading = ref(true);
const sortField = ref('name');
const sortOrder = ref(1);

// Filters for DataTable
const filters = ref({
  name: { value: null },
  email: { value: null },
  role: { value: null }
});

// Role options for filter dropdown
const roleOptions = ref(['admin', 'user', 'guest']);

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

function onSort(event) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
}

function viewUser(user) {
  toast.add({
    severity: 'info',
    summary: 'User Details',
    detail: `Viewing ${user.name}'s profile`,
    life: 3000
  });
}

function editUser(user) {
  toast.add({
    severity: 'warn',
    summary: 'Edit User',
    detail: `Editing ${user.name}'s information`,
    life: 3000
  });
}

function confirmDeleteUser(user) {
  toast.add({
    severity: 'error',
    summary: 'Delete User',
    detail: `Are you sure you want to delete ${user.name}?`,
    life: 3000
  });
}

onMounted(async () => {
  try {
    loading.value = true;
    const loadedUsers = await loadAll('users');

    // Add some sample data if no users exist
    if (loadedUsers.length === 0) {
      users.value = [
        { id: '1', name: 'John Smith', email: 'john.smith@example.com', role: 'admin' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'user' },
        { id: '3', name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'user' },
        { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com', role: 'guest' },
        { id: '5', name: 'Robert Brown', email: 'robert.b@example.com', role: 'user' },
        { id: '6', name: 'Lisa Anderson', email: 'lisa.a@example.com', role: 'admin' },
        { id: '7', name: 'David Martinez', email: 'david.m@example.com', role: 'user' },
        { id: '8', name: 'Jennifer Taylor', email: 'jennifer.t@example.com', role: 'guest' },
        { id: '9', name: 'William Garcia', email: 'william.g@example.com', role: 'user' },
        { id: '10', name: 'Maria Rodriguez', email: 'maria.r@example.com', role: 'user' },
        { id: '11', name: 'James Lee', email: 'james.lee@example.com', role: 'admin' },
        { id: '12', name: 'Patricia White', email: 'patricia.w@example.com', role: 'guest' }
      ];
    } else {
      users.value = loadedUsers;
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users data',
      life: 3000
    });
    users.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
