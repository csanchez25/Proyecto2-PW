import { createRouter, createWebHistory } from 'vue-router';
import AdminLogin from '../components/AdminLogin.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import UserCalendar from '../components/UserCalendar.vue';
import ManageUsers from '../components/ManageUsers.vue';

const routes = [
  { path: '/', component: AdminLogin },
  {
    path: '/admin',
    component: AdminDashboard,
    children: [
      { path: 'calendar', component: UserCalendar },
      { path: 'manage-users', component: ManageUsers }
    ]
  },
  {
    path: '/user',
    component: UserCalendar
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
