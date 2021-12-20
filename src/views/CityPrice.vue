<template lang="pug">
  div(class="q-pa-md")
    q-btn.q-mb-md(color="primary" label="Добавить стоимость" @click="price_form = true")
    template
      div(class="q-pa-md")
        q-table(
          class="my-sticky-dynamic"
          title="Стоимость доставки"
          :data="results"
          :columns="columns"
          :loading="loading"
          row-key="id"
          virtual-scroll
          :virtual-scroll-item-size="48"
          :virtual-scroll-sticky-size-start="48"
          :pagination.sync="pagination"
          :rows-per-page-options="[0]"
          @virtual-scroll="onScroll"
          style="height: 410px;"
        )
          template(v-slot:loading)
            q-inner-loading(showing color="primary")

    q-dialog(
      v-model="price_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить водителя
        q-card-section(class="row items-center")
            q-select(
              v-model="price.direction_from"
              label="Откуда"
              :options="options_city"
              style="width: 100%; margin-bottom: 10px"
            )
            q-select(
              v-model="price.direction_to"
              label="Куда"
              :options="options_city"
              style="width: 100%; margin-bottom: 10px; padding-bottom: 0;"
            )
            q-input(
              v-model="price.sendan"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Цена седан"
              stack-label
              autogrow
            )
            q-input(
              v-model="price.jeep"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Джип"
              stack-label
              autogrow
            )
            q-input(
              v-model="price.crossover"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Кроссовер"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Создать"
              color="primary"
              v-on:click="createPrice()"
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="price_form = false"
            )
</template>
<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
  export default {
    data(){
      return {
       price_form: false,
       options: [],
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
      options_city:[],
       price: {
         crossover: '',
         direction_from: '',
         direction_to: '',
         jeep: '',
         sendan: ''
       },
       results: [],
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
          name: 'sendan',
          required: true,
          label: 'Седан',
          align: 'left',
          field: 'sendan',
          sortable: true
        },
        {
          name: 'crossover',
          required: true,
          label: 'Кроссовер',
          align: 'left',
          field: 'crossover',
          sortable: true 
        },
        {
          name: 'jeep',
          required: true,
          label: 'Джип',
          align: 'left',
          field: 'jeep',
          sortable: true
        },
       ],
       loading: false,
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
    vm.Axios.get('/api/cities/').then(response => {
      const data = response.data.results
      for (const item in data) {
        vm.options_city.push({'label': data[item].name, 'value': data[item].pk})
      }
    });
  },
    methods: {
      update_data (nextpage = '/api/city-price/', update = false) {
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
        console.log(error.response)
        if (error.response.status > 400 && error.response.status < 405) {
          this.$store.dispatch('authorize', '')
        }
      })
    },
    createPrice(){
      const vm = this
      console.log(vm.price)
       vm.Axios.post('/api/city-price/add_price/', vm.price).then(response => {
         console.log(response);
         vm.price_form = false;
         vm.update_data()
       })
    },
     openTab (evt, row, index) {
      this.$store.dispatch('addOpenTab', row.id)
    },
    onScroll ({ to, ref }) {
      const vm = this
      const lastPage = Math.ceil(vm.page_settings.count / vm.page_settings.per_page)
      console.log(lastPage);
      const nextPage = Math.ceil(vm.results.length / vm.page_settings.per_page)
      const lastIndex = vm.results.length - 1
      if (vm.loading !== true && nextPage < lastPage && to === lastIndex) {
        console.log(123);
        this.loading = true
        this.$nextTick(() => {
          setTimeout(function () {
            vm.update_data(vm.page_settings.next, true)
            this.loading = false
          }, 500)
        })
      }
    },
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
              this.$store.dispatch('authorize', '')
            })
          }
        })
      }, 250)
    },
    }
  }
</script>

<style>
  .row.q-col-gutter-none .q-field__label {
    font-size: 14px;
  }
</style>
