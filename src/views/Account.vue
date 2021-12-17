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
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      user: {
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
    vm.Axios.defaults.baseURL = 'http://157.90.25.192:8001'
     vm.Axios.post('/api/operator/authorize/').then(response => {
        vm.user = response.data;
     });
  }
}
</script>
