<template>
  <section>
    <h1>Health Recommendations</h1>
    <DataTable ref="dt" v-model:filters="filters" :value="recommendations" :paginator="true" :rows="10" :dataKey="'id'"
      :loading="loading" :sortField="sortField" :sortOrder="sortOrder" filterDisplay="row" @sort="onSort($event)"
      aria-label="Health recommendations table with sorting and filtering" stripedRows responsiveLayout="scroll">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="m-0">Health Advice Management</h5>
          <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4">
          <i class="pi pi-heart text-4xl text-muted mb-3"></i>
          <p class="text-muted">No health recommendations found.</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center p-4">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
          <p class="mt-3">Loading recommendations...</p>
        </div>
      </template>

      <Column field="title" header="Title" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-file-text mr-2 text-primary"></i>
            <span class="font-semibold">{{ data.title || 'N/A' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter"
            placeholder="Search by title" aria-label="Filter by title" />
        </template>
      </Column>

      <Column field="category" header="Category" sortable>
        <template #body="{ data }">
          <Tag :value="data.category || 'General'" :severity="getCategorySeverity(data.category)"
            :icon="getCategoryIcon(data.category)" rounded />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown v-model="filterModel.value" :options="categoryOptions" placeholder="Select a Category"
            class="p-column-filter" showClear @change="filterCallback()" aria-label="Filter by category" />
        </template>
      </Column>

      <Column field="priority" header="Priority" sortable>
        <template #body="{ data }">
          <Tag :value="data.priority || 'Medium'" :severity="getPrioritySeverity(data.priority)" rounded />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown v-model="filterModel.value" :options="priorityOptions" placeholder="Select Priority"
            class="p-column-filter" showClear @change="filterCallback()" aria-label="Filter by priority" />
        </template>
      </Column>

      <Column field="targetAudience" header="Target Audience" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-users mr-2 text-muted"></i>
            <span>{{ data.targetAudience || 'All Users' }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter"
            placeholder="Search audience" aria-label="Filter by audience" />
        </template>
      </Column>

      <Column field="createdDate" header="Created" sortable dataType="date" exportHeader="Created Date">
        <template #body="{ data }">
          <div class="flex align-items-center">
            <i class="pi pi-calendar mr-2 text-muted"></i>
            <span>{{ formatDate(data.createdDate) }}</span>
          </div>
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
const recommendations = ref([]);
const loading = ref(true);
const sortField = ref('priority');
const sortOrder = ref(-1);
const dt = ref();

// Filters for DataTable
const filters = ref({
  title: { value: null },
  category: { value: null },
  priority: { value: null },
  targetAudience: { value: null }
});

// Category options for filter dropdown
const categoryOptions = ref(['Nutrition', 'Exercise', 'Mental Health', 'Sleep', 'Prevention', 'General']);

// Priority options for filter dropdown
const priorityOptions = ref(['High', 'Medium', 'Low']);

function getCategorySeverity(category) {
  switch (category?.toLowerCase()) {
    case 'nutrition':
      return 'success';
    case 'exercise':
      return 'info';
    case 'mental health':
      return 'warning';
    case 'sleep':
      return 'primary';
    case 'prevention':
      return 'danger';
    default:
      return 'secondary';
  }
}

function getCategoryIcon(category) {
  switch (category?.toLowerCase()) {
    case 'nutrition':
      return 'pi pi-apple';
    case 'exercise':
      return 'pi pi-forward';
    case 'mental health':
      return 'pi pi-heart';
    case 'sleep':
      return 'pi pi-moon';
    case 'prevention':
      return 'pi pi-shield';
    default:
      return 'pi pi-info-circle';
  }
}

function getPrioritySeverity(priority) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'secondary';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function onSort(event) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
}

const exportCSV = () => {
  dt.value.exportCSV();
};

onMounted(async () => {
  try {
    loading.value = true;

    // Load health recommendations from Firestore
    recommendations.value = await loadAll('healthRecommendations')
  } catch (error) {
    console.error('Failed to load recommendations:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load recommendations data',
      life: 3000
    });
    recommendations.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
