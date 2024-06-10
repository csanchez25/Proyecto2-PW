<template>
  <div class="login-page d-flex align-items-center justify-content-center vh-100 bg-gradient">
    <div class="login-container bg-white p-4 rounded shadow">
      <h2 class="mb-4">Admin Login</h2>
      <form @submit.prevent="login">
        <div class="form-group mb-3">
          <label for="username" class="form-label">Username</label>
          <input id="username" v-model="username" type="text" class="form-control" placeholder="Enter username" required>
        </div>
        <div class="form-group mb-3">
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="password" type="password" class="form-control" placeholder="Enter password" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
      </form>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
    login() {
      const user = this.$store.getters.getUsuario(this.username);
      if (user && user.password === this.password) {
        if (user.role === 'admin') {
          this.$router.push('/admin/calendar');
        } else {
          this.$router.push('/user');
        }
      } else {
        this.error = 'Invalid credentials';
      }
    }
  }
};
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to right, #6a11cb, #2575fc);
}
</style>
