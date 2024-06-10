<template>
  <div class="manage-users container">
    <h2 class="mb-4">Manage Users</h2>
    <form @submit.prevent="addUser">
      <div class="form-group mb-3">
        <label for="name" class="form-label">Name</label>
        <input id="name" v-model="newUser.name" type="text" class="form-control" placeholder="Enter name" required>
      </div>
      <div class="form-group mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" v-model="newUser.email" type="email" class="form-control" placeholder="Enter email" required>
      </div>
      <div class="form-group mb-3">
        <label for="username" class="form-label">Username</label>
        <input id="username" v-model="newUser.username" type="text" class="form-control" placeholder="Enter username" required>
      </div>
      <div class="form-group mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" v-model="newUser.password" type="password" class="form-control" placeholder="Enter password" required>
      </div>
      <div class="form-group mb-3">
        <label for="role" class="form-label">Role</label>
        <select id="role" v-model="newUser.role" class="form-select" required>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Add User</button>
    </form>
    <table class="table mt-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Username</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button class="btn btn-secondary me-2" @click="editUser(index)">Edit</button>
            <button class="btn btn-danger" @click="confirmDelete(index)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="editingIndex !== null" class="modal show d-block" tabindex="-1" @click.self="cancelEdit">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit User</h5>
            <button type="button" class="btn-close" @click="cancelEdit"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateUser">
              <div class="form-group mb-3">
                <label for="editName" class="form-label">Name</label>
                <input id="editName" v-model="editUserForm.name" type="text" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="editEmail" class="form-label">Email</label>
                <input id="editEmail" v-model="editUserForm.email" type="email" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="editUsername" class="form-label">Username</label>
                <input id="editUsername" v-model="editUserForm.username" type="text" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="editPassword" class="form-label">Password</label>
                <input id="editPassword" v-model="editUserForm.password" type="password" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="editRole" class="form-label">Role</label>
                <select id="editRole" v-model="editUserForm.role" class="form-select" required>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Update User</button>
              <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="deleteIndex !== null" class="modal show d-block" tabindex="-1" @click.self="cancelDelete">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="cancelDelete"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this user?</p>
            <button class="btn btn-danger" @click="deleteUser(deleteIndex)">Yes</button>
            <button class="btn btn-secondary" @click="cancelDelete">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ManageUsers',
  data() {
    return {
      users: this.$store.state.usuarios,
      newUser: {
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'user'
      },
      editingIndex: null,
      editUserForm: {
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'user'
      },
      deleteIndex: null
    };
  },
  methods: {
    addUser() {
      this.$store.commit('agregarUsuario', { ...this.newUser, id: Date.now() });
      this.resetNewUserForm();
    },
    editUser(index) {
      this.editingIndex = index;
      this.editUserForm = { ...this.users[index] };
    },
    updateUser() {
      this.$store.commit('actualizarUsuario', { ...this.editUserForm, id: this.users[this.editingIndex].id });
      this.cancelEdit();
    },
    confirmDelete(index) {
      this.deleteIndex = index;
    },
deleteUser(index) {
  this.$store.commit('eliminarUsuario', this.users[index].id);
  this.cancelDelete();
},
    cancelDelete() {
      this.deleteIndex = null;
    },
    cancelEdit() {
      this.editingIndex = null;
      this.resetEditUserForm();
    },
    resetNewUserForm() {
      this.newUser = {
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'user'
      };
    },
    resetEditUserForm() {
      this.editUserForm = {
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'user'
      };
    }
  }
};
</script>

<style scoped>
.manage-users {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
}

.modal.show {
  display: block;
}

.modal-backdrop {
  z-index: -1;
}
</style>
