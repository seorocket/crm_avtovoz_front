<template lang="pug">
  q-layout(view="lHh LpR fFf" id="app2")
    q-header( elevated class="bg-primary text-white" height-hint="98")
      q-toolbar(style="justify-content: space-between;")
        q-btn(dense flat round icon="menu" @click="$store.commit('turnLeftDrawer')")
        div(class="text-h5" style="margin-left: 20px;") Avtovoz CRM
        q-icon(name="power_settings_new" @click="logOut()")
      q-tabs(align="left")
        q-route-tab(to="/" label="Заказы")
        template(v-for="t in orderTabs")
          q-route-tab(:key="'tab_' + t" :to="`/order/${t}`" :label="`# ${t}`")
          q-btn(
            padding="none"
            color="red"
            icon="close"
            @click="$store.dispatch('closeTab', t)"
            :key="'close_' + t")
    q-drawer(
        v-model="drawer"
        show-if-above
        :mini="miniStateDrawer"
        @click.capture="drawerClick"
        :width="200"
        :breakpoint="500"
        bordered
        content-class="bg-grey-3")

      q-scroll-area(class="fit")
        q-list(padding)
          <!--q-item(clickable v-ripple to="/")-->
            <!--q-item-section(avatar)-->
              <!--q-icon(name="source")-->
            <!--q-item-section Задачи-->

          q-item(clickable v-ripple to="/drivers")
            q-item-section(avatar)
              q-icon(name="drive_eta")
            q-item-section Водители

          //- q-item(clickable v-ripple to="/stat")
          //-   q-item-section(avatar)
          //-     q-icon(name="bar_chart")
          //-   q-item-section Статистика
    q-page-container
      router-view

    q-dialog(
      v-model="dialog"
      persistent
      )
      q-card
        q-card-section(class="row items-center")
          span(class="q-ml-sm text-h6") Авторизация
        q-card-section(class="row items-center")
          form(@submit.prevent="authorization()" method="post" id="login" style="min-width: 400px")
            q-input(
              v-model="login.username"
              label="Логин"
              type="text"
              lazy-rules
              outlined
              stack-label
              style="width: 100%; margin-bottom: 10px"
            )
            q-input(
              outlined
              v-model="login.password"
              hint=""
              type="password"
              label="Пароль"
              stack-label
              style="width: 100%"
            )
            q-btn(
              flat
              label="Войти"
              color="primary"
              type="submit"
              )
</template>
<script>

import { mapState } from 'vuex'

export default {
  data () {
    return {
      login: {
        username: '',
        password: ''
      },
      dialog: true,
      drawer: false
    }
  },
  'token' (event) {
    if (event === '') {
      this.dialog = true
    }
  },
  computed: {
    ...mapState([
      'miniStateDrawer',
      'orderTabs',
      'token',
      'axios'
    ])
  },
  beforeMount () {
    if (this.token) {
      this.dialog = false
    } else {
      this.dialog = true
    }
  },
  methods: {
    drawerClick (e) {
      // if in "mini" state and user
      // click on drawer, we switch it to "normal" mode
      if (this.miniState) {
        this.miniState = false
        // notice we have registered an event with capture flag;
        // we need to stop further propagation as this click is
        // intended for switching drawer to "normal" mode only
        e.stopPropagation()
      }
    },
    logOut () {
      const vm = this
      vm.$store.dispatch('authorize', '')
      vm.dialog = true
    },
    authorization () {
      const vm = this
      vm.Axios.post('/api/api-token-auth/', vm.login).then(response => {
        vm.Axios.defaults.headers.common.Authorization = 'JWT ' + response.data.token
        vm.dialog = false
        this.$store.dispatch('authorize', response.data.token)
      })
    }
  }
}
</script>
<style>
  .q-tabs__content .q-btn.q-btn-item {
    position: relative;
    font-size: 0.8em;
    top: -14px;
    margin-left: -19.2px;
    cursor: pointer;
  }
</style>
