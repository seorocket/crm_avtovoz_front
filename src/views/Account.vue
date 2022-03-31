<template lang="pug">
  div
    div.row
      div.q-pa-md
        div Имя: {{user.first_name}}
        div Фамилия: {{user.last_name}}
        div Телефон: {{user.phone}}
        div Телеграм: {{user.telegram}}
        q-btn(
          flat
          label="Изменить"
          color="primary"
          v-on:click="popup.edit_popup = true"
          )
    q-dialog(
      v-model="popup.edit_popup"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить Сервис
        q-card-section(class="row items-center")
            q-input(
              label="Имя"
              :value="user.first_name"
              style="width: 100%"
              v-model="user.first_name")
            q-input(
              label="Фамилия"
              :value="user.last_name"
              style="width: 100%"
              v-model="user.last_name")
            q-input(
              label="Телефон"
              :value="user.phone"
              style="width: 100%"
              v-model="user.phone")
            q-input(
              label="Телеграм"
              :value="user.telegram"
              style="width: 100%"
              v-model="user.telegram")
        q-card-section(class="row items-center")
            q-btn(
              flat
              label="Изменить"
              color="primary"
              v-on:click="updateData()"
              )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="popup.edit_popup = false"
              )
</template>
<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  data () {
    return {
      user: {
        pk: '',
        first_name: '',
        last_name: '',
        phone: '',
        telegram: ''
      },
      popup: {
        edit_popup: false
      }
    }
  },
  computed: {
    ...mapState([
      'token'
    ])
  },
  beforeMount () {
    const vm = this
    vm.Axios.get('/api/operator/authorize/').then(response => {
      vm.user = response.data
    })
  },
  methods: {
    showNotify (position, message, color) {
      this.$q.notify({
        color: color,
        textColor: 'white',
        message: message,
        position: position,
        timeout: 3000
      })
    },
    updateData () {
      const vm = this
      vm.Axios.patch(`/api/operator/${vm.user.pk}/`, vm.user).then(response => {
        vm.Axios.get('/api/operator/authorize/').then(response => {
          vm.user = response.data
          vm.popup.edit_popup = false
          vm.showNotify('top-right', 'Данные обновлены', 'positive')
        })
      })
    }
  }
}
</script>
