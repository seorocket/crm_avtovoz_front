<template lang="pug">
  div.q-pa-md(style="margin-bottom: 80px;")
    q-btn.q-mb-md(color="primary" label="Добавить водителя" @click="driver_form = true")
    q-input.q-mb-md(
      outlined
      v-model="search"
      label="Поиск"
      style="width: 350px"
    )
    q-table(
      title="Водители"
      :data="drivers"
      :columns="columns"
      row-key="name"
      hide-pagination
      selection="multiple"
      :selected.sync="selected"
    )
    q-dialog(
      v-model="driver_form"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Добавить водителя
        q-card-section(class="row items-center")
            q-input(
              v-model="driver.name"
              label="Имя"
              type="text"
              lazy-rules
              outlined
              stack-label
              style="width: 100%; margin-bottom: 10px"
            )
            q-input(
              outlined
              v-model="driver.phone"
              hint=""
              type="text"
              label="Телефон"
              stack-label
              style="width: 100%; margin-bottom: 10px; padding-bottom: 0;"
            )
            q-input(
              v-model="driver.info"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Доп. информация"
              stack-label
              autogrow
            )
            q-input(
              v-model="driver.comment"
              outlined
              style="width: 100%; margin-bottom: 10px"
              label="Комментарий"
              stack-label
              autogrow
            )
            q-btn(
              flat
              label="Создать"
              color="primary"
              v-on:click="createDriver()"
            )
            q-btn(
              flat
              label="Отмена"
              color="primary"
              v-on:click="driver_form = false"
            )
    div.bottom_save_line.fixed-bottom-right(v-if="selected.length")
      q-btn(
        type="submit"
        :loading="submitting"
        label="Удалить"
        @click="deleteObject(selected)"
        color="red")
        template(v-slot:loading)
          q-spinner-facebook
</template>
<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      driver_form: false,
      search: '',
      driver: {
        name: '',
        phone: '',
        info: '',
        comment: ''
      },
      submitting: false,
      selected: [],
      drivers: [],
      drivers_tmp: [],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 30,
        max: 5
        // rowsNumber: xx if getting data from a server
      },
      columns: [
        { name: 'name', align: 'left', label: 'Имя', field: 'name', sortable: true },
        { name: 'phone', align: 'center', label: 'Телефон', field: 'phone', sortable: true },
        { name: 'info', align: 'center', label: 'Инфо', field: 'info' },
        { name: 'comment', label: 'Комментарий', field: 'comment' }
      ]
    }
  },
  watch: {
    'search' (event) {
      const vm = this
      if (event !== '') {
        vm.drivers = vm.drivers_tmp.filter(item => item.name.toLowerCase().indexOf(event.toLowerCase()) > -1)
      } else {
        vm.drivers = vm.drivers_tmp
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
    vm.updateDrivers()
  },
  methods: {
    deleteObject (data) {
      const vm = this
      for (const item in data) {
        vm.Axios.delete('/api/drivers/' + data[item].id + '/').then(response => {
          if (item === data.length - 1) {
            vm.updateDrivers()
            vm.selected = []
          }
        })
      }
    },
    updateDrivers () {
      const vm = this
      vm.Axios.get('/api/drivers/').then(response => {
        vm.drivers = response.data.results
        vm.drivers_tmp = response.data.results
      }).catch((error) => {
        console.log(error.response.data)
        this.$store.dispatch('authorize', '')
      })
    },
    createDriver () {
      const vm = this
      vm.Axios.post('/api/drivers/', vm.driver).then(response => {
        vm.driver = {
          name: '',
          phone: '',
          info: '',
          comment: ''
        }
        vm.driver_form = false
        vm.updateDrivers()
      })
    }
  }
}
</script>
