<template lang="pug">
  div(class="q-pa-md")
    div(class="q-pa-md q-gutter-sm")
      div
        template(v-for="b in rate_count")
          q-btn(
            color="white"
            text-color="black"
            :key="b.name"
            :label="`${b.name}: (${b.rate})`"
            v-on:click="filter_orders_rate(b.type)"
          )
      template(v-for="b in statuses")
        q-btn(
          color="white"
          text-color="black"
          :key="b.name"
          :label="`${b.name} ${ b.alias ? '(' + page_settings.counts[b.alias] + ')' : ''}`"
          v-on:click="filter_orders(b.id)"
        )
      template
        div.text-h6.q-pb-xs.q-pt-md Фильтры
        form(@submit.prevent="filterOrdersStr()" method="post" id="login" style="min-width: 400px")
          div.row.q-col-gutter-none
            div.col-md-2.q-pa-sm
              q-input(
                v-model="order_filters.id"
                type="text"
                label="ID заявки"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="order_filters.car"
                type="text"
                label="Модель авто"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="order_filters.dir_from"
                type="text"
                label="Направление - откуда"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="order_filters.dir_to"
                type="text"
                label="Направление - куда"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="order_filters.phone"
                type="text"
                label="Телефон"
                filled
                style="width: 100%")

          div.row.q-col-gutter-none
            div.col-md-2.q-pa-sm
              q-input(filled label="Дата от" v-model="order_filters.dt_start")
                template(v-slot:prepend)
                  q-icon(name="event" class="cursor-pointer")
                    q-popup-proxy(transition-show="scale" transition-hide="scale")
                      q-date(v-model="order_filters.dt_start" mask="YYYY-MM-DD HH:mm")
                        div(class="row items-center justify-end")
                          q-btn(v-close-popup label="Закрыть" color="primary" flat)

                template(v-slot:append)
                  q-icon(name="access_time" class="cursor-pointer")
                    q-popup-proxy(transition-show="scale" transition-hide="scale")
                      q-time(v-model="order_filters.dt_start" mask="YYYY-MM-DD HH:mm" format24h)
                        div(class="row items-center justify-end")
                          q-btn(v-close-popup label="Закрыть" color="primary" flat)

            div.col-md-2.q-pa-sm
              q-input(filled label="Дата до" v-model="order_filters.dt_end")
                template(v-slot:prepend)
                  q-icon(name="event" class="cursor-pointer")
                    q-popup-proxy(transition-show="scale" transition-hide="scale")
                      q-date(v-model="order_filters.dt_end" mask="YYYY-MM-DD HH:mm")
                        div(class="row items-center justify-end")
                          q-btn(v-close-popup label="Закрыть" color="primary" flat)

                template(v-slot:append)
                  q-icon(name="access_time" class="cursor-pointer")
                    q-popup-proxy(transition-show="scale" transition-hide="scale")
                      q-time(v-model="order_filters.dt_end" mask="YYYY-MM-DD HH:mm" format24h)
                        div(class="row items-center justify-end")
                          q-btn(v-close-popup label="Закрыть" color="primary" flat)

          div.col-md-2.q-pa-sm
            q-btn(color="primary" type="submit" label="Применить фильтры" @click="filterOrdersStr()")
    template
      div(class="q-pa-md")
        q-table(
          class="my-sticky-dynamic"
          title="ЗАКАЗЫ"
          :data="results"
          :columns="columns"
          :loading="loading"
          row-key="id"
          virtual-scroll
          :virtual-scroll-item-size="48"
          :virtual-scroll-sticky-size-start="48"
          :rows-per-page-options="[0]"
          @virtual-scroll="onScroll"
          v-on:row-click="openTab"
          style="height: 410px;"
        )
          template(v-slot:loading)
            q-inner-loading(showing color="primary")

</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  data () {
    return {
      page_settings: {
        next: null,
        previous: null,
        num_pages: 0,
        per_page: 0,
        page: 0,
        count_on_page: 0,
        count: 0,
        first: 0,
        last: 0,
        counts: {}
      },
      order_filters: {
        id: '',
        phone: '',
        dir_from: '',
        dir_to: '',
        car: '',
        dt_start: '',
        dt_end: ''
      },
      results: [],
      loading: false,
      current_status: 1,
      current_rate: '',
      statuses: [{
        name: 'Новые',
        id: 1,
        alias: 'new'
      },
      {
        name: 'С звонка',
        id: 8,
        alias: 'from_call'
      },
      {
        name: 'Расчёт цены',
        id: 2,
        alias: 'price_calculate'
      },
      {
        name: 'Подписание договора',
        id: 3,
        alias: 'contract'
      },
      {
        name: 'Первые 50%',
        id: 4,
        alias: 'first_fifty'
      },
      {
        name: 'Завершена',
        id: 5
      },
      {
        name: 'Перезвонить',
        id: 6
      },
      {
        name: 'Архив',
        id: 7
      },
      {
        name: 'Отказ',
        id: 0
      }],
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'ID',
          field: 'id',
          sortable: true
        },
        {
          name: 'from_to',
          required: true,
          label: 'Направление',
          align: 'left',
          field: 'from_to',
          sortable: true
        },
        {
          name: 'rate',
          required: true,
          label: 'Рейтинг',
          align: 'left',
          field: 'rate',
          sortable: false
        },
        {
          name: 'auto',
          required: true,
          label: 'Автомобиль',
          align: 'left',
          field: 'auto',
          sortable: false
        },
        {
          name: 'operator',
          required: true,
          label: 'Оператор',
          align: 'left',
          field: row => row.operator,
          sortable: false
        },
        {
          name: 'phone',
          required: true,
          label: 'Телефон',
          align: 'left',
          field: row => row.client.phone,
          format: val => val,
          sortable: false
        },
        {
          name: 'site_name',
          required: true,
          label: 'Сайт',
          align: 'left',
          field: 'site_name',
          sortable: false
        },
        {
          name: 'datetime',
          required: true,
          label: 'Дата поступления',
          align: 'left',
          field: row => row.datetime,
          format: val => date.formatDate(val, 'DD.MM.YYYY HH:mm'),
          sortable: true
        }
      ],
      rate_count: [
       {
         name: '',
         type: 0,
         rate: 0
       }
      ],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 30,
        max: 5
      }
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
    vm.update_data()
  },
  mounted () {
  },
  methods: {
    filter_orders (status) {
      const vm = this
      vm.current_status = status
      vm.update_data('/api/orders/?status=' + vm.current_status, false)
    },
    filter_orders_rate (rate) {
      const vm = this
      vm.current_rate = rate
      vm.update_data('/api/orders/?rate=' + vm.current_rate, false)
    },
    filterOrdersStr () {
      const vm = this
      vm.current_status = status
      let params = []
      for (const key in vm.order_filters) {
        if (vm.order_filters[key]) {
          if (key == 'id'){
              params.push('search=' + vm.order_filters[key])
          } else{
              params.push(key + '=' + vm.order_filters[key])
          }
        }
      }
      if (params.length) {        
        params = params.join('&')
        params = '?' + params
      } else {
        params = ''
      }
      vm.update_data('/api/orders/' + params, false)
    },
    update_data (nextpage = '/api/orders/?status=' + this.current_status, update = false) {
      const vm = this
      vm.Axios.get(nextpage).then(response => {
        vm.page_settings = response.data
        vm.pagination.rowsNumber = response.data.count
        
        if (update) {
          vm.results = vm.results.concat(vm.page_settings.results)
        } else {
          vm.results = vm.page_settings.results
        }
        vm.loading = false
      }).catch((error) => {
        if (error.response.status > 400 && error.response.status < 405) {
          this.$store.dispatch('authorize', '')
        }
      })
      vm.Axios.get('/api/orders/get_count_rate/').then(response => {
         vm.rate_count = response.data
      })
    },
    onScroll ({ to, ref }) {
      const vm = this
      const lastPage = Math.ceil(vm.page_settings.count / vm.page_settings.per_page)
      const nextPage = Math.ceil(vm.results.length / vm.page_settings.per_page)
      const lastIndex = vm.results.length - 1
      if (vm.loading !== true && nextPage < lastPage && to === lastIndex) {
        this.loading = true
        this.$nextTick(() => {
          setTimeout(function () {
            vm.update_data(vm.page_settings.next, true)
            this.loading = false
          }, 500)
        })
      }
    },
    openTab (evt, row, index) {
      this.$store.dispatch('addOpenTab', row.id)
    }
  }
}
</script>
<style>
  .row.q-col-gutter-none .q-field__label {
    font-size: 14px;
  }
</style>
