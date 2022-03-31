<template lang="pug">
  div(class="q-pa-md")
    div.col-md-2.q-pa-sm
      q-btn.q-mb-md(color="primary" label="Добавить стоимость" @click="price_form = true")
    div.col-md-2.q-pa-sm
      q-btn.q-mb-md(color="primary" label="Добавить город" @click="city_form = true")
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
          template(#body-cell-action="props")
            q-td
              q-btn(dense flat round color="blue" field="edit" label="Изменить" @click="editPrice(props.row)")
          template(v-slot:loading)
            q-inner-loading(showing color="primary")

    q-dialog(
      v-model="city_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить город
        q-card-section(class="row items-center")
            q-input(
              v-model="citys"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Город"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Добавить"
              color="primary"
              v-on:click="addCity()"
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="city_form = false"
            )

    q-dialog(
      v-model="edit_price_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Редактировать стоимость
        q-card-section(class="row items-center")
            q-input(
              v-model="price.sedan"
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
              label="Цена джип"
              stack-label
              autogrow
            )
            q-input(
              v-model="price.crossover"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Цена кроссовер"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Обновить"
              color="primary"
              v-on:click="updatePrice()"
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="edit_price_form = false"
            )

    q-dialog(
      v-model="price_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить стоимость
        q-card-section(class="row items-center")
            q-select(
              filled
              v-model="price.direction_from"
              hide-selected
              use-input
              fill-input
              input-debounce="0"
              label="Откуда"
              :options="options_city"
              @filter="(val, update, abort) => filterFn(val, update, abort, 'cities')"
              style="width: 100%; margin-bottom: 10px"
            )
            q-select(
              filled
              hide-selected
              use-input
              fill-input
              input-debounce="0"
              v-model="price.direction_to"
              label="Куда"
              :options="options_city"
              @filter="(val, update, abort) => filterFn(val, update, abort, 'cities')"
              style="width: 100%; margin-bottom: 10px; padding-bottom: 0;"
            )
            q-input(
              v-model="price.sedan"
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
  data () {
    return {
      price_form: false,
      edit_price_form: false,
      city_form: false,
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
      options_city: [],
      price: {
        pk: '',
        crossover: '',
        direction_from: '',
        direction_to: '',
        jeep: '',
        sedan: ''
      },
      results: [],
      citys: '',
      columns: [
        {
          name: 'pk',
          align: 'left',
          label: 'ID',
          field: 'pk',
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
          name: 'sedan',
          required: true,
          label: 'Седан',
          align: 'left',
          field: 'sedan',
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
        {
          name: 'action',
          align: 'right',
          label: 'Action',
          field: 'action'
        }
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
    vm.update_data()
    vm.get_city_opt()
  },
  methods: {
    get_city_opt () {
      const vm = this
      vm.Axios.get('/api/cities/').then(response => {
        const data = response.data.results
        for (const item in data) {
          vm.options_city.push({ label: data[item].name, value: data[item].pk })
        }
      })
    },
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
      })
    },
    editPrice (row) {
      const vm = this
      vm.price.pk = row.pk
      vm.price.sedan = row.sedan
      vm.price.jeep = row.jeep
      vm.price.crossover = row.crossover
      vm.edit_price_form = true
    },
    updatePrice () {
      const vm = this
      vm.Axios.patch(`/api/city-price/${vm.price.pk}/`, vm.price).then(response => {
        vm.edit_price_form = false
        vm.pk = ''
        vm.price.sndan = ''
        vm.price.jeep = ''
        vm.price.crossover = ''
        vm.update_data()
        vm.showNotify('top-right', 'Данные обновлены', 'positive')
      })
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
    addCity () {
      const vm = this
      vm.Axios.post('/api/cities/', { name: vm.citys }).then(response => {
        vm.city_form = false
        vm.citys = ''
        vm.showNotify('top-right', 'Данные добавлены', 'positive')
        vm.get_city_opt()
      })
    },
    createPrice () {
      const vm = this
      for (let key in vm.price) {
        if (typeof(vm.price[key]) == 'object') {
          vm.price[key] = vm.price[key].value
        }
      }
      vm.Axios.post('/api/city-price/', vm.price).then(response => {
        vm.price_form = false
        vm.update_data()
        vm.showNotify('top-right', 'Данные добавлены', 'positive')
      })
    },
    openTab (evt, row, index) {
      this.$store.dispatch('addOpenTab', row.id)
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
              vm.options_city = response.data.results.map(v => ({ label: v.name, value: v.pk }))
            })
          }
        })
      }, 250)
    }
  }
}
</script>

<style>
  .row.q-col-gutter-none .q-field__label {
    font-size: 14px;
  }
</style>
