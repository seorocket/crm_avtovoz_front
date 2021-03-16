<template lang="pug">
  q-drawer(
    v-model="isLeftDrawerOpenLocal"
    bordered
    content-class="bg-grey-2"
  )
    //--q-list
      q-item-label(header) Essential Links
      q-item(clickable tag="a" target="_blank" href="https://quasar.dev")
        q-item-section(avatar)
          q-icon(name="school")
        q-item-section
          q-item-label Docs
          q-item-label(caption) quasar.dev
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'LeftDrawer',
  computed: {
    isLeftDrawerOpenLocal: {
      get () {
        return this.isLeftDrawerOpen
      },
      set (newVal) {
        this.$store.commit('turnLeftDrawer')
      }
    },
    ...mapState([
      'isLeftDrawerOpen'
    ])
  }
}
</script>
