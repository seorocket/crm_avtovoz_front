<template lang="pug">
  div(class="q-pa-md")
    q-btn.q-mb-md(color="primary" label="Добавить стоянку" @click="parking_form = true")
    template
      div(class="q-pa-md")
        q-table(
          class="my-sticky-dynamic"
          title="Стоянки"
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
              q-btn(dense flat round color="blue" field="edit" label="Редактировать" @click="parking_form=true; parking=props.row")
          template(#body-cell-action_del="props")
            q-td
              //- q-btn(dense flat round color="red" field="edit" label="Удалить" @click="deleteObject(props.row.id)")

          template(v-slot:loading)
            q-inner-loading(showing color="primary")
    q-dialog(
      v-model="parking_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить стоянку
        q-card-section(class="row items-center")
            q-input(
              v-model="parking.city"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Город"
              stack-label
              autogrow
            )
            q-input(
              v-model="parking.address"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Адрес"
              stack-label
              type="textarea"
              autogrow
            )
            q-input(
              v-model="parking.contact"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Контакты"
              type="textarea"
              stack-label
              autogrow
            )
            q-input(
              v-model="parking.comment"
              outlined
              style="width: 100%; margin-bottom: 10px"
              type="textarea"
              label="Комментарий"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Создать"
              color="primary"
              v-on:click="createParking()"
              v-if="!parking.id"
            )
            q-btn(
              flat
              label="Обновить"
              color="primary"
              v-on:click="editObject()"
              v-else
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="parking_form = false"
            )
</template>
<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  data () {
    return {
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
      parking_form: false,
      results: [],
      parking: {
        city: '',
        address: '',
        contact: '',
        comment: ''
      },
      columns: [
        {
          name: 'action',
          align: 'left',
          label: 'Редактировать',
          field: 'action'
        },
        {
          name: 'id',
          align: 'left',
          label: 'ID',
          field: 'id',
          sortable: true
        },
        {
          name: 'city',
          required: true,
          label: 'Город',
          align: 'left',
          field: 'city',
          sortable: true
        },
        {
          name: 'address',
          required: true,
          label: 'Адрес',
          align: 'left',
          field: 'address',
          sortable: true
        },
        {
          name: 'contact',
          required: true,
          label: 'Контакты',
          align: 'left',
          field: 'contact',
          sortable: true
        },
        {
          name: 'comment',
          required: true,
          label: 'Комментарий',
          align: 'left',
          field: 'comment',
          sortable: true
        },
        {
          name: 'action_del',
          align: 'left',
          label: 'Удалить',
          field: 'action_del'
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
    vm.update_data()
  },
  methods: {
    update_data (nextpage = '/api/parking/', update = false) {
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
          console.log(error.response)
        }
      })
    },
    editObject() {
      const vm = this
      vm.Axios.patch(`/api/parking/${vm.parking.id}/`, vm.parking).then(response => {
        vm.parking_form = false
        vm.update_data()
      })
    },
    deleteObject(id){
      const vm = this
      vm.Axios.delete(`/api/parking/${id}/`).then(response => {
        vm.parking_form = false
        vm.update_data()
      })
    },
    createParking () {
      const vm = this
      vm.Axios.post('/api/parking/', vm.parking).then(response => {
        console.log(response)
        vm.parking_form = false
        vm.update_data()
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
        console.log(123)
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
              console.log(error.response)
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
