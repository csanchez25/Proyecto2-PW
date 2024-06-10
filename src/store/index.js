import { createStore } from 'vuex';

export default createStore({
  state: {
    usuarios: [
      { id: 1, name: 'Admin', email: 'admin@example.com', username: 'admin', password: 'admin', role: 'admin' },
      { id: 2, name: 'User', email: 'user@example.com', username: 'user', password: 'user', role: 'user' }
    ],
    eventos: [
      {
        id: 1717723737007,
        title: 'Evento de Ejemplo',
        description: 'Descripción del evento de ejemplo',
        type: 'meeting',
        start: new Date().toISOString(),
        end: new Date(new Date().getTime() + 3600000).toISOString(),
        creator: 'admin@example.com',
        invitees: ['user@example.com']
      }
    ]
  },
  getters: {
    getUsuario: (state) => (username) => {
      return state.usuarios.find(user => user.username === username);
    },
    obtenerEventosPorUsuario: (state) => (email) => {
      return state.eventos.filter(evento =>
        evento.creator === email ||
        evento.invitees.includes(email)
      );
    }
  },
  mutations: {
    agregarEvento(state, evento) {
      state.eventos.push(evento);
    },
    actualizarEvento(state, evento) {
      const index = state.eventos.findIndex(e => e.id === evento.id);
      if (index !== -1) {
        state.eventos.splice(index, 1, evento);
      }
    },
    eliminarEvento(state, id) {
      const index = state.eventos.findIndex(e => e.id === id);
      if (index !== -1) {
        state.eventos.splice(index, 1);
      }
    },
    agregarUsuario(state, usuario) {
      state.usuarios.push(usuario);
    },
    actualizarUsuario(state, usuarioActualizado) {
      const index = state.usuarios.findIndex(u => u.id === usuarioActualizado.id);
      if (index !== -1) {
        state.usuarios.splice(index, 1, usuarioActualizado);
      }
    },
    eliminarUsuario(state, id) {
      const index = state.usuarios.findIndex(u => u.id === id);
      if (index !== -1) {
        state.usuarios.splice(index, 1);
      }
    }
  }
});
