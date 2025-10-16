import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Lara from '@primeuix/themes/lara';

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import Tooltip from 'primevue/tooltip';

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import PrimeVue Icons
import 'primeicons/primeicons.css'

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Lara
    }
});
app.use(ToastService);

// Register PrimeVue Components globally
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Dropdown', Dropdown);
app.component('Tag', Tag);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Toast', Toast);
app.component('Avatar', Avatar);
app.component('Dialog', Dialog);
app.component('Checkbox', Checkbox);

// Register PrimeVue directives
app.directive('tooltip', Tooltip);

app.use(router);
app.mount('#app');
