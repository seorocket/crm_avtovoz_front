<template lang="pug">
  div(class="q-pa-md")
    div(class="q-pa-md q-gutter-sm")
      template
        div.text-h6.q-pb-xs.q-pt-md
        form(@submit.prevent="submitFile()" method="post" style="min-width: 400px")
          div.row.q-col-gutter-none
            div.col-md-2.q-pa-sm
              q-input(
                v-model="document.number_doc"
                type="text"
                label="Номер документа"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="document.file"
                type="file"
                label="Файл"
                filled
                id="file"
                ref="file"
                @change="handleFileUpload()"
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-input(
                v-model="document.comment"
                type="text"
                label="Комментарий"
                filled
                style="width: 100%")
            div.col-md-2.q-pa-sm
              q-select(
                filled
                v-model="document.operator"
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
            div.col-md-2.q-pa-sm
              q-btn(color="primary" type="submit" label="Добавить документ" @click="submitFile()")
    template
      div(class="q-pa-md")
        q-table(
          class="my-sticky-dynamic"
          title="Документы"
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
    data(){
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
       document: {
          number_doc: '',
          comment: '',
          file: '',
          operator: '',
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
          name: 'number_doc',
          required: true,
          label: 'Номер документа',
          align: 'left',
          field: 'number_doc',
          sortable: true
        },
        {
          name: 'comment',
          required: true,
          label: 'Комментарий',
          align: 'left',
          field: 'comment',
          sortable: false
        },
        {
          name: 'file',
          required: true,
          label: 'Документ',
          align: 'left',
          field: 'file',
          format: val => `Скачать`,
          sortable: false
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
  },
    methods: {
      update_data (nextpage = '/api/document/', update = false) {
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
     openTab (evt, row, index) {
      window.open(row.file);
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
      submitFile(){
            const vm = this
        if (!vm.submitting) {
            vm.submitting = true
            let formData = new FormData();
            formData.append('file', vm.document.file);
            formData.append('number_doc', vm.document.number_doc);
            formData.append('comment', vm.document.comment);
            formData.append('operator', vm.document.operator.value);
            vm.Axios.post( '/api/document/',
                formData,
                {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
              }
            ).then(function(){
             vm.submitting = false
             vm.update_data()
        })
        .catch(function(){
          vm.submitting = false
        });
       }
      },
      handleFileUpload(){
        this.document.file = this.$refs.file.value[0];
      }
    }
  }
</script>

<style>
  .row.q-col-gutter-none .q-field__label {
    font-size: 14px;
  }
</style>
