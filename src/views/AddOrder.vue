<template lang="pug">
  div(class="q-pa-md")
    div(class="q-pa-md q-gutter-sm")
      template
        div.text-h6.q-pb-xs.q-pt-md
        form(method="post" style="min-width: 400px")
          div.row.q-col-gutter-none
            div.col-md-2.q-pa-sm
              q-input(
                v-model="createOrder_data.client_phone"
                type="text"
                label="Номер телефона"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="createOrder_data.client_name"
                type="text"
                label="Имя клиента"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="createOrder_data.direction_from"
                type="text"
                label="Откуда"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="createOrder_data.direction_to"
                type="text"
                label="Куда"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="createOrder_data.auto"
                type="text"
                label="Модель авто"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-select(
                filled
                v-model="createOrder_data.status"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                label="Статус"
                :options="options_stat"
                style="width: 250px"
                :clearable="true")

                template(v-slot:no-option)
                  q-item
                    q-item-section.text-grey Нет данных
            div.col-md-3.q-pa-sm
              q-select(
                filled
                v-model="createOrder_data.operator"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                label="Оператор"
                :options="options"
                @filter="(val, update, abort) => filterFn(val, update, abort, 'operator')"
                @filter-abort="abortFilterFn"
                style="width: 250px"
                hint="Например: ibragim"
                :clearable="true")

                template(v-slot:no-option)
                  q-item
                    q-item-section.text-grey Нет данных
            div.col-md-4.q-pa-sm
              q-btn(color="primary" type="button" label="Добавить заявку" @click="createOrder()")
</template>
<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
  export default {
    data(){
      return {
       options: [],
       options_stat: [{
        label: 'Новые',
        value: 1
      },
      {
        label: 'С звонка',
        value: 8
      },
      {
        label: 'Расчёт цены',
        value: 2
      },
      {
        label: 'Подписание договора',
        value: 3
      },
      {
        label: 'Первые 50%',
        value: 4
      },
      {
        label: 'Завершена',
        value: 5
      },
      {
        label: 'Перезвонить',
        value: 6
      },
      {
        label: 'Архив',
        value: 7
      },
      {
        label: 'Отказ',
        value: 0
      }],
       createOrder_data:{
         client_phone: '',
         client_name: '',
         status: '',         
         direction_from: '',
         direction_to: '',
         auto: '',
         site_name: 'crm'         
       },
       results: [],
       loading: false,
      }
    },
    computed: {
    ...mapState([
      'token'
    ])
  },
  watch: {
    'token' (event) {
      const vm = this
      vm.update_data()
    }
  },
  beforeMount () {
    const vm = this
    this.loading = true
    vm.Axios.defaults.headers.common.Authorization = 'JWT ' + vm.token
    vm.Axios.defaults.baseURL = 'http://157.90.25.192:8001'
  },
    methods: {
    filterFn (val, update, abort, url) {
        const vm = this
        setTimeout(() => {
          if (val.length < 2) {
            abort()
            return
          }
        update(() => {
          if (val === '') {
            this.options = []
          } else {
            const needle = val.toLowerCase()
            vm.Axios.get('/api/' + url + '/?name=' + needle).then(response => {
              vm.options = response.data.results.map(v => ({ label: v.username, value: v.pk }))
            }).catch((error) => {
               console.log(error)
            })
          }
        })
      }, 250)
    },
     createOrder () {
      const vm = this
      if (!vm.submitting) {
        vm.submitting = true
        vm.createOrder_data.status = vm.createOrder_data.status.value
        vm.createOrder_data.operator = vm.createOrder_data.operator.value
        vm.Axios.post('api/create-order/', vm.createOrder_data).then(response => {
          vm.showNotify('top-right', response.data.message, 'positive')
          vm.submitting = false
        })
      }
    },
    }
  }
</script>

<style>
  .row.q-col-gutter-none .q-field__label {
    font-size: 14px;
  }
</style>
