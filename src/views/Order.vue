<template lang="pug">
  div(v-if="Object.keys(data).length != 0")
    div.q-pa-md(style="margin-bottom: 80px;")
      div.row.q-col-gutter-none.q-pb-md
        div.col-md-3
          q-select(
            square
            filled
            v-model="data.status"
            :options="statuses"
            label="Статус"
            style="width: 250px"
          )

      div.text-h6.q-pb-xs Направление
      div.row.q-col-gutter-none
        div.col-md-3
          q-select(
            filled
            v-model="data.direction_from"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Город отправки"
            :options="options"
            @filter="(val, update, abort) => filterFn(val, update, abort, 'cities')"
            @filter-abort="abortFilterFn"
            style="width: 250px"
            hint="Например: Москва"
            :clearable="true"
          )
            template(v-slot:no-option)
              q-item
                q-item-section.text-grey Нет данных

        div.col-md-3
          q-select(
            filled
            v-model="data.direction_to"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Город прибытия"
            :options="options"
            @filter="(val, update, abort) => filterFn(val, update, abort, 'cities')"
            @filter-abort="abortFilterFn"
            style="width: 250px"
            hint="Например: Краснодар"
            :clearable="true"
          )
            template(v-slot:no-option)
              q-item
                q-item-section.text-grey Нет данных

      div.text-h6.q-pb-xs.q-pt-md Цены
      div.row.q-col-gutter-none
        div.col-md-3
          q-input(
            v-model.number="data.order_price"
            type="number"
            label="Цена для клиента"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-input(
            v-model.number="data.driver_price"
            type="number"
            label="Цена перевозки"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-input(
            v-model="data.delta"
            type="number"
            label="Дельта"
            filled
            standout
            readonly
            :hint=`data.driver_price && data.order_price? '' : 'Заполните все цены'`
            style="max-width: 250px")

      div.text-h6.q-pb-xs.q-pt-md Инфо о клиенте
      div.row.q-col-gutter-none
        div.col-md-3
          q-input(
            v-model.number="data.client.name"
            type="text"
            label="Имя"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-input(
            filled
            v-model="data.client.phone"
            label="Телефон"
            mask="+7 ### ### ## ##"
            fill-mask
            style="max-width: 250px")

      div.text-h6.q-pb-xs.q-pt-md Инфо о заказе
      div.row.q-col-gutter-none
        div.col-md-3
          q-input(
            v-model="data.auto"
            type="text"
            label="Модель авто"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-input(
            v-model="data.number"
            type="text"
            label="Номер договора"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-select(
            filled
            v-model="data.driver"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Водитель автовоза"
            :options="options"
            @filter="(val, update, abort) => filterFn(val, update, abort, 'drivers')"
            @filter-abort="abortFilterFn"
            style="width: 250px"
            :clearable="true"
          )
            template(v-slot:no-option)
              q-item
                q-item-section.text-grey Нет данных

        div.col-md-3
          q-select(
            filled
            v-model="data.site"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Сайт"
            :options="options"
            @filter="(val, update, abort) => filterFn(val, update, abort, 'sites')"
            @filter-abort="abortFilterFn"
            style="width: 250px"
            :clearable="true"
          )
            template(v-slot:no-option)
              q-item
                q-item-section.text-grey Нет данных

      div.text-h6.q-pb-xs.q-pt-md Комментарий
      div.row.q-col-gutter-none
        div.col-md-6
          q-input(
            v-model="data.comment"
            filled
            clearable
            type="textarea"
          )

    div.bottom_save_line.fixed-bottom-right(v-if="save")
      q-btn(
        type="submit"
        :loading="submitting"
        label="Сохранить"
        @click="updateObject(data)"
        color="teal")
        template(v-slot:loading)
          q-spinner-facebook

</template>
<script>
import router from '../router/index.js'
import { mapState } from 'vuex'

export default {
  data () {
    return {
      current_page_id: router.currentRoute.params.id,
      model: null,
      options: [],
      tmp: '',
      old_tmp: '',
      data: {},
      save: false,
      submitting: false,
      statuses: [{ value: 0, label: 'Отказ' }, { value: 1, label: 'Новая заявка' }, { value: 2, label: 'Расчёт цены' }, { value: 3, label: 'Подписание договора' }, { value: 4, label: 'Первые 50%' }, { value: 5, label: 'Завершена' }, { value: 6, label: 'Перезвонить' }, { value: 7, label: 'Архив' }, { value: 8, label: 'Звонок с сайта' }]
    }
  },
  watch: {
    // отслеживаем изменение заказа
    data: {
      deep: true,
      handler: function (value) {
        this.tmp = JSON.stringify(value)
      }
    },
    'tmp' (event) {
      if (this.old_tmp !== '' && this.old_tmp !== event) {
        this.save = true
      } else {
        this.save = false
      }
    },
    'token' (event) {
      const vm = this
      vm.Axios.get('/api/orders/' + vm.current_page_id + '/').then(response => {
        vm.data = response.data
        vm.tmp = JSON.stringify(response.data)
        vm.old_tmp = JSON.stringify(response.data)
      })
    },
    'data.order_price' (event) {
      if (this.data.driver_price && this.data.order_price) {
        this.data.delta = this.data.order_price - this.data.driver_price
      } else {
        this.data.delta = 0
      }
    },
    'data.driver_price' (event) {
      if (this.data.driver_price && this.data.order_price) {
        this.data.delta = this.data.order_price - this.data.driver_price
      } else {
        this.data.delta = 0
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
    vm.Axios.get('/api/orders/' + vm.current_page_id + '/').then(response => {
      vm.data = response.data
      vm.tmp = JSON.stringify(response.data)
      vm.old_tmp = JSON.stringify(response.data)
    }).catch((error) => {
      console.log(error.response.data)
      this.$store.dispatch('authorize', '')
    })
    router.beforeEach((to, from, next) => {
      if (to.name === 'Order') {
        vm.Axios.get('/api/orders/' + to.params.id + '/').then(response => {
          vm.data = response.data
          vm.tmp = JSON.stringify(response.data)
          vm.old_tmp = JSON.stringify(response.data)
        })
      }
      next()
    })
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
              vm.options = response.data.results.map(v => ({ label: v.name, value: v.pk }))
            }).catch((error) => {
              console.log(error.response.data)
              this.$store.dispatch('authorize', '')
            })
          }
        })
      }, 250)
    },
    abortFilterFn () {
    },
    updateObject (data) {
      const vm = this
      if (!vm.submitting) {
        vm.submitting = true
        setTimeout(() => {
          const tmpData = {}
          const orderPattern = {
            id: 'int',
            auto: 'str',
            number: 'str',
            order_price: 'int',
            driver_price: 'int',
            datetime: 'datetime',
            status: 'fk',
            direction_from: 'fk',
            direction_to: 'fk',
            source: 'fk',
            client: 'obj',
            site: 'fk',
            driver: 'fk',
            comment: 'str'
          }

          for (const key in orderPattern) {
            if (key === 'client' && data[key].phone) {
              data[key].phone = data[key].phone.replace(/ /g, '').trim()
            }
            if (orderPattern[key] === 'fk') {
              if (data[key]) {
                tmpData[key] = data[key].value
              } else {
                tmpData[key] = ''
              }
            } else if (orderPattern[key] === 'int') {
              if (!data[key]) {
                tmpData[key] = null
              } else {
                tmpData[key] = data[key]
              }
            } else {
              tmpData[key] = data[key]
            }
          }
          vm.Axios.patch('/api/orders-edit/' + vm.current_page_id + '/', tmpData).then(response => {
            vm.tmp = JSON.stringify(response.data)
            vm.old_tmp = JSON.stringify(response.data)
            vm.submitting = false
          }).catch((error) => {
            console.log(error.response.data)
            this.$store.dispatch('authorize', '')
          })
        }, 500)
      }
    }
  }
}
</script>
<style>
  .bottom_save_line {
    width: 100%;
    text-align: right;
    padding: 20px;
    background: rgba(0,0,0,0.1);
  }
  .q-field__control .q-field__append:nth-child(3) {
    display: none;
  }
</style>
