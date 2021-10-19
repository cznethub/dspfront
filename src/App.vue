<template>
  <div class="main-container">
    <cz-header-nav />
    <div class="main-content" id="content">
      <router-view v-if="!isLoading" name="content" />
    </div>
    <router-view name="footer" />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import CzFooter from '@/components/base/cz.footer.vue'
  import CzHeaderNav from '@/components/base/cs.header-nav.vue'
  import User from '@/models/user.model'
  import Zenodo from '@/models/zenodo.model'
  
  @Component({
    name: 'app',
    components: { CzFooter, CzHeaderNav },
  })
  export default class App extends Vue {
    protected isLoading = true

    async created() {
      document.title = 'CZ Hub'
      // Check for Authorization cookie instead. 
      // const isAuthorized = this.$cookies.get('Authorization')
      // TODO: if the user is not logged in in the server, the client auth cookie needs to be deleted
      // Reproducible if the server is restarted
      // if (isAuthorized && !User.$state.isLoggedIn) {
      await User.checkAuthorization()
      // }
      
      if (User.$state.isLoggedIn) {
        await Zenodo.init()
      }

      this.isLoading = false
    }
  }
</script>

<style lang="scss" scoped>
  .main-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .main-content {
    flex-grow: 1;
  }
</style>
