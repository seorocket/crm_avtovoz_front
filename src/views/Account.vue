<template lang="pug">
  div
    div.row
      div.q-pa-md
        div Имя: {{user.name}}
        div Фамилия: {{user.lastname}}
        div Телефон: {{user.phone}}
        div Телеграм: {{user.telegram}}
        div Кол-во активных заявок: {{user.active}}
        div Кол-во завершенных заявок: {{user.success}}
        div Общее количество заработанных средств(грязынми и чистыми): {{user.money}}
        div Кол-во активных заявок за текущий месяц: {{user.active_month}}
        div Кол-во завершенных заявок за текущий месяц: {{user.success_month}}
        div Общее количество заработанных средств(грязынми и чистыми) за месяц: {{user.money_month}}
        div Token телеграм: {{user.token}}
        q-btn(
          flat
          label="Изменить"
          color="primary"
          v-on:click="popup.edit_ac = true"
          )
    q-dialog(
      v-model="popup.edit_ac"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить Сервис
        q-card-section(class="row items-center")
            q-input(
              label="Имя"
              :value="text"
              style="width: 100%"
              v-model="user.name")
            q-input(
              label="Фамилия"
              :value="text"
              style="width: 100%"
              v-model="user.lastname")
            q-input(
              label="Телефон"
              :value="text"
              style="width: 100%"
              v-model="user.phone")
            q-input(
              label="Телеграм"
              :value="text"
              style="width: 100%"
              v-model="user.telegram")
        q-card-section(class="row items-center")
            q-btn(
              flat
              label="Изменить"
              color="primary"
              v-on:click="updateAc(user.id)"
              )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="closeAc()"
              )
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      user: {
        id: '-',
        name: '-',
        lastname: '-',
        phone: '-',
        telegram: '-',
        active: '-',
        success: '-',
        money: '-',
        active_month: '-',
        success_month: '-',
        money_month: '-',
        token: '-'         
      },
      popup:{
        edit_ac: false,
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
    vm.Axios.defaults.headers.common.Authorization = 'JWT ' + vm.token
    vm.Axios.defaults.baseURL = 'https://autoirr.ru'
     vm.Axios.post('/api/operator/authorize/').then(response => {
        vm.user = response.data;
     });
  },
  methods: {
    closeAc(){
        const vm = this
       vm.Axios.post('/api/operator/authorize/').then(response => {
        vm.user = response.data;
        vm.popup.edit_ac = false;
     });
    },
    showNotify (position, message, color) {
      this.$q.notify({
        color: color, 
        textColor: 'white', 
        message: message, 
        position: position,
        timeout: 3000
      })
    },
    updateAc(id){
      const vm = this
      vm.Axios.post('/api/operator/update_ac/', vm.user).then(response => {
        console.log(response.data)
        vm.Axios.post('/api/operator/authorize/').then(response => {
          vm.user = response.data;
           vm.popup.edit_ac = false;
           vm.showNotify('top-right', 'Данные обновлены', 'positive')
        });
      });
    }
  }
}
</script>
