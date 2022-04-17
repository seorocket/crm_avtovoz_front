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
              q-select(
                filled
                v-model="createOrder_data.direction_from"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                label="Откуда"
                :options="options"
                @filter="(val, update, abort) => filterFn(val, update, abort, 'cities')"
                style="width: 100%"
                :clearable="true")

            div.col-md-2.q-pa-sm
              q-select(
                filled
                v-model="createOrder_data.direction_to"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                label="Откуда"
                :options="options"
                @filter="(val, update, abort) => filterFn(val, update, abort, 'cities')"
                style="width: 100%"
                :clearable="true")
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
                style="width: 100%"
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
                style="width: 100%"
                :clearable="true")

                template(v-slot:no-option)
                  q-item
                    q-item-section.text-grey Нет данных
        div.text-h6.q-pb-xs.q-pt-md
            div.col-md-4.q-pa-sm
              q-btn(color="primary" type="button" label="Добавить заявку" @click="createOrder()")
</template>
<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  data () {
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
      createOrder_data: {
        client_phone: '',
        client_name: '',
        status: '',
        direction_from: '',
        direction_to: '',
        auto: '',
        site_name: 'Из црм'
      },
      results: [],
      loading: false,
      submitting: false
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
    vm.Axios.get('/api/operator/').then(response => {
      vm.options = response.data.results.map(v => ({ label: v.first_name, value: v.pk }))
    })
  },
  methods: {
    filterFn (val, update, abort, url) {
      const vm = this
      setTimeout(() => {
        update(() => {
          const needle = val.toLowerCase()
          vm.Axios.get('/api/' + url + '/?name=' + needle).then(response => {
            vm.options = response.data.results.map(v => ({ label: v.name, value: v.pk }))
          })
        })
      }, 250)
    },
    createOrder () {
      const vm = this
      if (!vm.submitting) {
        vm.submitting = true
        for (let key in vm.createOrder_data) {
          if (typeof(vm.createOrder_data[key]) == 'object') {
            if (!!~['operator', 'status'].indexOf(key)) {
              vm.createOrder_data[key] = vm.createOrder_data[key].value
            } else {
              vm.createOrder_data[key] = vm.createOrder_data[key].label
            }
          }
        }
        vm.Axios.post('api/create-order/', vm.createOrder_data).then(response => {
            vm.createOrder_data = {
              client_phone: '',
              client_name: '',
              status: '',
              direction_from: '',
              direction_to: '',
              auto: '',
              site_name: 'Из црм'
            }
        })
        vm.submitting = false
      }
    }
  }
}
</script>

<style>
  .row.q-col-gutter-none .q-field__label {
    font-size: 14px;
  }
</style>
