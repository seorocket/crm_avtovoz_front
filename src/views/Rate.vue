<template lang="pug">
  div(class="q-pa-md")
    q-btn.q-mb-md(color="primary" label="Добавить рейтинг направления" @click="rate_form = true")
    template
      div(class="q-pa-md")
        q-table(
          class="my-sticky-dynamic"
          title="Рейтинг направления"
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
              q-btn(dense flat round color="blue" field="edit" label="Изменить" @click="editRate(props.row)")
          template(v-slot:loading)
            q-inner-loading(showing color="primary")

    q-dialog(
      v-model="edit_rate_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Изменить рейтинг направления
        q-card-section(class="row items-center")
            q-checkbox(
              v-model="rate.direction"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Из этого города?"
              stack-label
              autogrow
            )
            q-input(
              v-model="rate.rate"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Рейтинг"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Создать"
              color="primary"
              v-on:click="updateRate()"
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="edit_rate_form = false"
            )

    q-dialog(
      v-model="rate_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить рейтинг направления
        q-card-section(class="row items-center")
            q-input(
              v-model="rate.city"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Город"
              stack-label
              autogrow
            )
            q-checkbox(
              v-model="rate.direction"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Из этого города?"
              stack-label
              autogrow
            )
            q-input(
              v-model="rate.rate"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Рейтинг"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Создать"
              color="primary"
              v-on:click="createRate()"
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="rate_form = false"
            )
</template>
<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  data () {
    return {
      rate_form: false,
      edit_rate_form: false,
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
      rate: {
        pk: '',
        city: '',
        direction: '',
        rate: ''
      },
      results: [],
      citys: '',
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'ID',
          field: 'pk',
          sortable: true
        },
        {
          name: 'city',
          required: true,
          label: 'Город',
          align: 'left',
          field: 'citys',
          sortable: true
        },
        {
          name: 'directions',
          required: true,
          label: 'Из этого города',
          align: 'left',
          field: 'directions',
          sortable: true
        },
        {
          name: 'rate',
          required: true,
          label: 'Рейтинг',
          align: 'left',
          field: 'rate',
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
    update_data (nextpage = '/api/rate/', update = false) {
      const vm = this
      vm.Axios.get(nextpage).then(response => {
        vm.results = response.data
        vm.loading = false
      }).catch((error) => {
        console.log(error.response)
      })
    },
    editRate (row) {
      const vm = this
      vm.rate.pk = row.pk
      vm.rate.city = row.city
      vm.rate.direction = row.direction
      vm.rate.rate = row.rate
      vm.edit_rate_form = true
    },
    updateRate () {
      const vm = this
      vm.Axios.post('/api/rate/update_rate/', vm.rate).then(response => {
        vm.edit_rate_form = false
        vm.rate.pk = ''
        vm.rate.city = ''
        vm.rate.direction = ''
        vm.rate.rate = ''
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
      vm.Axios.post('/api/city-price/add_city/', { city: vm.citys }).then(response => {
        console.log(response)
        vm.city_form = false
        vm.citys = ''
        vm.showNotify('top-right', 'Данные добавлены', 'positive')
        get_city_opt()
      })
    },
    createRate () {
      const vm = this
      vm.Axios.post('/api/rate/add_rate/', vm.rate).then(response => {
        console.log(response)
        vm.rate_form = false
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
      console.log(lastPage)
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
