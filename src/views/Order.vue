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

      div.text-h6.q-pb-xs.q-pt-md Оплата
      div.row.q-col-gutter-none
        div.col-md-3
          q-input(
            v-model.number="data.pre_paid"
            type="number"
            label="Первая часть"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-input(
            v-model.number="data.past_paid"
            type="number"
            label="Вторая часть"
            filled
            style="max-width: 250px")

        div.col-md-3
          q-input(
            v-model="data.debt"
            type="number"
            label="Долг клиента"
            filled
            standout
            readonly
            :hint=`data.driver_price ? '' : 'Заполните цену перевозки'`
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
            fill-mask
            style="max-width: 250px")

        div.col-md-3
          q-input(
            filled
            v-model="data.ship_dt"
            label="Желаемая дата доставки"
            fill-mask
            readonly
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
            :options="options_driver"
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
      options_driver: [],
      tmp: '',
      old_tmp: '',
      data: {},
      save: false,
      submitting: false,
      statuses: [{ value: 0, label: 'Отказ' }, { value: 1, label: 'Новая заявка' }, { value: 2, label: 'Расчёт цены' }, { value: 3, label: 'Подписание договора' }, { value: 4, label: 'Первые 50%' }, { value: 5, label: 'Завершена' }, { value: 6, label: 'Перезвонить' }, { value: 7, label: 'Архив' }, { value: 8, label: 'Звонок с сайта' }, { value: 9, label: 'Неверный номер' }, { value: 10, label: 'В работе' }]
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
        this.data.debt = this.data.order_price - (this.pre_paid + this.past_paid)
      } else {
        this.data.delta = 0
        this.data.debt = 0
      }
    },
    'data.driver_price' (event) {
      if (this.data.driver_price && this.data.order_price) {
        this.data.delta = this.data.order_price - this.data.driver_price
      } else {
        this.data.delta = 0
      }
    },
    'data.pre_paid' (event) {
      if (this.data.order_price) {
        this.data.debt = this.data.order_price - (this.data.pre_paid + this.data.past_paid)
      }
    },
    'data.past_paid' (event) {
      if (this.data.order_price) {
        this.data.debt = this.data.order_price - (this.data.pre_paid + this.data.past_paid)
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
    vm.Axios.get('/api/orders/' + vm.current_page_id + '/').then(response => {
      vm.data = response.data
      vm.tmp = JSON.stringify(response.data)
      vm.old_tmp = JSON.stringify(response.data)
    }).catch((error) => {
      // window.location.href = '/'
    })
    vm.Axios.get('/api/drivers/').then(response => {
      const data = response.data.results
      for (const item in data) {
        vm.options_driver.push({ label: data[item].name, value: data[item].pk })
      }
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
        update(() => {
          if (val === '') {
            this.options = []
          } else {
            const needle = val.toLowerCase()
            vm.Axios.get('/api/' + url + '/?name=' + needle).then(response => {
              vm.options = response.data.results.map(v => ({ label: v.name, value: v.pk }))
            }).catch((error) => {
              window.location.href = '/'
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
            pre_paid: 'int',
            past_paid: 'int',
            ship_dt: 'str',
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
            vm.data = response.data
            vm.tmp = JSON.stringify(response.data)
            vm.old_tmp = JSON.stringify(response.data)
            vm.submitting = false
          }).catch((error) => {
            window.location.href = '/'
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
