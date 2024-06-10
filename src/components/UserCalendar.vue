<template>
  <div class="calendar-page container">
    <div class="calendar-controls">
      <button @click="setView('month')" :class="{ active: currentView === 'month' }">Mes</button>
      <button @click="setView('week')" :class="{ active: currentView === 'week' }">Semana</button>
      <button @click="setView('day')" :class="{ active: currentView === 'day' }">Día</button>
      <button @click="previous" class="navigation-button">&lt;</button>
      <span class="current-date">{{ currentDateFormatted }}</span>
      <button @click="next" class="navigation-button">&gt;</button>
    </div>
    <div v-if="currentView === 'month'" class="calendar">
      <div class="calendar-header">
        <div v-for="day in daysOfWeek" :key="day" class="calendar-day">
          {{ day }}
        </div>
      </div>
      <div class="calendar-body">
        <div v-for="day in visibleDays" :key="day.date" class="calendar-cell" @click="selectDay(day)">
          <div>{{ day.date.getDate() }}</div>
          <div v-for="event in day.events" :key="event.id" class="event" @click.stop="editEvent(event)">
            {{ event.title }} ({{ formatEventTime(event) }})
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentView === 'week'" class="calendar">
      <div class="calendar-header">
        <div v-for="day in daysOfWeek" :key="day" class="calendar-day">
          {{ day }}
        </div>
      </div>
      <div class="calendar-body">
        <div v-for="day in visibleDays" :key="day.date" class="calendar-cell" @click="selectDay(day)">
          <div>{{ day.date.getDate() }}</div>
          <div v-for="event in day.events" :key="event.id" class="event" @click.stop="editEvent(event)">
            {{ event.title }} ({{ formatEventTime(event) }})
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentView === 'day'" class="day-view">
      <div class="hour-cell" v-for="hour in 24" :key="hour">
        <div class="hour-label">{{ hour }}:00</div>
        <div class="events">
          <div v-for="event in getEventsForHour(hour)" :key="event.id" class="event">
            {{ event.title }} ({{ formatEventTime(event) }})
          </div>
        </div>
      </div>
    </div>
    <div v-if="showEventDialog" class="modal show d-block" tabindex="-1" @click.self="closeDialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar' : 'Agregar' }} Evento</h5>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEvent">
              <div class="form-group mb-3">
                <label for="title" class="form-label">Título</label>
                <input id="title" v-model="eventForm.title" type="text" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="description" class="form-label">Descripción</label>
                <input id="description" v-model="eventForm.description" type="text" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="type" class="form-label">Tipo</label>
                <select id="type" v-model="eventForm.type" class="form-control" required>
                  <option value="meeting">Reunión</option>
                  <option value="task">Tarea</option>
                  <option value="event">Evento</option>
                </select>
              </div>
              <div class="form-group mb-3">
                <label for="start" class="form-label">Inicio</label>
                <input id="start" v-model="eventForm.start" type="datetime-local" class="form-control" required>
              </div>
              <div class="form-group mb-3">
                <label for="end" class="form-label">Fin</label>
                <input id="end" v-model="eventForm.end" type="datetime-local" class="form-control" required>
              </div>
              <button type="submit" class="btn btn-primary">{{ isEditing ? 'Actualizar' : 'Agregar' }} Evento</button>
              <button type="button" class="btn btn-secondary" @click="deleteEvent" v-if="isEditing">Eliminar</button>
              <button type="button" class="btn btn-secondary" @click="closeDialog">Cancelar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCalendar',
  data() {
    return {
      currentView: 'month',
      currentDate: new Date(),
      daysOfWeek: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      daysInMonth: [],
      showEventDialog: false,
      eventForm: {
        title: '',
        description: '',
        type: 'meeting',
        start: '',
        end: '',
        invitees: []
      },
      selectedDay: null,
      isEditing: false,
      currentEvent: null,
    };
  },
  computed: {
    events() {
      return this.$store.state.eventos;
    },
    usuarios() {
      return this.$store.state.usuarios;
    },
    visibleDays() {
      console.log('Calculating visible days for view:', this.currentView);
      if (this.currentView === 'month') {
        return this.getDaysInMonth();
      } else if (this.currentView === 'week') {
        return this.getDaysInWeek();
      } else if (this.currentView === 'day') {
        return this.getDaysInDay();
      }
      return [];
    },
    currentDateFormatted() {
      if (this.currentView === 'month') {
        return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      } else if (this.currentView === 'week') {
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.getDate()} ${this.monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${this.monthNames[endOfWeek.getMonth()]} ${this.currentDate.getFullYear()}`;
      } else if (this.currentView === 'day') {
        return `${this.currentDate.getDate()} ${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      }
      return '';
    }
  },
  methods: {
    setView(view) {
      console.log('Setting view:', view);
      this.currentView = view;
      this.updateVisibleDays();
    },
    previous() {
      console.log('Navigating to previous view:', this.currentView);
      if (this.currentView === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      } else if (this.currentView === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
      } else if (this.currentView === 'day') {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
      }
      this.forceUpdateView();
    },
    next() {
      console.log('Navigating to next view:', this.currentView);
      if (this.currentView === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      } else if (this.currentView === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
      } else if (this.currentView === 'day') {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
      }
      this.forceUpdateView();
    },
    forceUpdateView() {
      console.log('Forcing update of view:', this.currentView);
      // Fuerza la actualización de la vista actual
      this.setView(this.currentView);
    },
    selectDay(day) {
      console.log('Day selected:', day.date);
      this.selectedDay = day;
      this.eventForm.start = this.formatDateTime(day.date);
      this.eventForm.end = this.formatDateTime(day.date);
      this.showEventDialog = true;
      this.resetForm();
    },
    editEvent(event) {
      console.log('Editing event:', event);
      this.currentEvent = event;
      this.eventForm = {
        ...event,
        start: this.formatDateTime(event.start),
        end: this.formatDateTime(event.end),
      };
      this.showEventDialog = true;
      this.isEditing = true;
    },
    saveEvent() {
      if (this.isEditing) {
        console.log('Updating event:', this.currentEvent);
        const updatedEvent = { 
          ...this.currentEvent, 
          ...this.eventForm
        };
        this.$store.commit('actualizarEvento', updatedEvent);
      } else {
        console.log('Saving new event:', this.eventForm);
        const newEvent = {
          id: Date.now(),
          ...this.eventForm,
          creator: this.getCurrentUser().email,
          start: new Date(this.eventForm.start).toISOString(),
          end: new Date(this.eventForm.end).toISOString()
        };
        this.$store.commit('agregarEvento', newEvent);
      }
      this.forceUpdateView(); // Forza la actualización de la vista
      this.closeDialog();
    },
    deleteEvent() {
      console.log('Deleting event:', this.currentEvent);
      this.$store.commit('eliminarEvento', this.currentEvent.id);
      this.forceUpdateView(); // Forza la actualización de la vista
      this.closeDialog();
    },
    closeDialog() {
      console.log('Closing dialog');
      this.showEventDialog = false;
      this.isEditing = false;
    },
    resetForm() {
      console.log('Resetting form');
      this.eventForm = {
        title: '',
        description: '',
        type: 'meeting',
        start: this.formatDateTime(this.selectedDay.date),
        end: this.formatDateTime(this.selectedDay.date),
        invitees: []
      };
    },
    getCurrentUser() {
      const currentUserEmail = this.$route.path.includes('/admin') ? 'admin@example.com' : 'user@example.com';
      const user = this.$store.state.usuarios.find(user => user.email === currentUserEmail) || null;
      console.log('Current user:', user);
      return user;
    },
    getDaysInMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const days = [];
      for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
        days.push({
          date: new Date(day),
          events: this.events.filter(event => {
            const eventStartDate = new Date(event.start);
            const eventEndDate = new Date(event.end);
            return (eventStartDate.toDateString() === day.toDateString() || eventEndDate.toDateString() === day.toDateString() ||
                    (eventStartDate <= day && eventEndDate >= day));
          }),
        });
      }

      console.log('Days in month:', days);
      return days;
    },
    getDaysInWeek() {
      const startOfWeek = new Date(this.currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const days = [];
      for (let day = new Date(startOfWeek); day <= endOfWeek; day.setDate(day.getDate() + 1)) {
        days.push({
          date: new Date(day),
          events: this.events.filter(event => {
            const eventStartDate = new Date(event.start);
            const eventEndDate = new Date(event.end);
            return (eventStartDate.toDateString() === day.toDateString() || eventEndDate.toDateString() === day.toDateString() ||
                    (eventStartDate <= day && eventEndDate >= day));
          }),
        });
      }

      console.log('Days in week:', days);
      return days;
    },
    getDaysInDay() {
      const days = [{
        date: new Date(this.currentDate),
        events: this.events.filter(event => {
          const eventStartDate = new Date(event.start);
          const eventEndDate = new Date(event.end);
          return (eventStartDate.toDateString() === this.currentDate.toDateString() || eventEndDate.toDateString() === this.currentDate.toDateString() ||
                  (eventStartDate <= this.currentDate && eventEndDate >= this.currentDate));
        }),
      }];

      console.log('Days in day:', days);
      return days;
    },
    formatDateTime(date) {
      const d = new Date(date);
      const offset = d.getTimezoneOffset();
      const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
      return adjustedDate.toISOString().slice(0, 16);
    },
    formatEventTime(event) {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      if (this.currentView === 'day') {
        return `${startDate.toLocaleString('es-CR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return `${startDate.toLocaleDateString('es-CR')} - ${endDate.toLocaleDateString('es-CR')}`;
      }
    },
    getEventsForHour(hour) {
      const today = new Date(this.currentDate);
      const events = this.events.filter(event => {
        const eventStartDate = new Date(event.start);
        const eventEndDate = new Date(event.end);
        return (
          eventStartDate.getDate() === today.getDate() &&
          eventStartDate.getMonth() === today.getMonth() &&
          eventStartDate.getFullYear() === today.getFullYear() &&
          eventStartDate.getHours() <= hour &&
          eventEndDate.getHours() >= hour
        );
      });

      console.log('Events for hour:', hour, events);
      return events;
    },
    addEventToDays(event) {
      const eventStartDate = new Date(event.start);
      const eventEndDate = new Date(event.end);

      for (let day of this.daysInMonth) {
        if (eventStartDate.toDateString() === day.date.toDateString() || eventEndDate.toDateString() === day.date.toDateString() ||
            (eventStartDate <= day.date && eventEndDate >= day.date)) {
          day.events.push(event);
        }
      }

      console.log('Event added to days:', event);
    },
    removeEventFromDays(eventId) {
      for (let day of this.daysInMonth) {
        day.events = day.events.filter(event => event.id !== eventId);
      }

      console.log('Event removed from days:', eventId);
    },
    updateVisibleDays() {
      console.log('Updating visible days for view:', this.currentView);
      if (this.currentView === 'month') {
        this.daysInMonth = this.getDaysInMonth();
      } else if (this.currentView === 'week') {
        this.daysInMonth = this.getDaysInWeek();
      } else if (this.currentView === 'day') {
        this.daysInMonth = this.getDaysInDay();
      }
      console.log('Visible days:', this.daysInMonth);
    },
  },
  watch: {
    currentDate() {
      console.log('Current date changed:', this.currentDate);
      this.forceUpdateView(); // Actualiza la vista cuando cambia la fecha
    },
    currentView() {
      console.log('Current view changed:', this.currentView);
      this.forceUpdateView(); // Actualiza la vista cuando cambia la vista
    }
  },
  mounted() {
    console.log('Component mounted, initializing visible days');
    this.updateVisibleDays();
  },
};
</script>

<style scoped>
.calendar-page {
  padding: 20px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-controls button {
  margin-right: 10px;
}

.calendar-controls button.active {
  font-weight: bold;
}

.navigation-button {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 5px 10px;
  cursor: pointer;
}

.navigation-button:hover {
  background-color: #eaeaea;
}

.current-date {
  margin: 0 20px;
  font-size: 1.2em;
  font-weight: bold;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #ccc;
}

.calendar-header,
.calendar-body {
  display: contents;
}

.calendar-day,
.calendar-cell {
  padding: 16px;
  background-color: white;
  border: 1px solid #ddd;
}

.day-view {
  display: grid;
  grid-template-rows: repeat(24, 1fr);
  gap: 1px;
}

.hour-cell {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
}

.hour-label {
  width: 60px;
  text-align: right;
  padding-right: 10px;
}

.event {
  margin-top: 8px;
  padding: 4px;
  background-color: #2575fc;
  color: white;
  border-radius: 4px;
}

.modal.show {
  display: block;
}

.modal-backdrop {
  z-index: -1;
}
</style>
