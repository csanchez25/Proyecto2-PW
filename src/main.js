import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';
import '@vueform/multiselect/themes/default.css';

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');
