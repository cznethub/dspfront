<template>
  <div class="main-container">
    <cz-header-nav />
    <div class="main-content">
      <router-view v-if="!isLoading" name="content" />
    </div>
    <router-view name="footer" />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import CzFooter from '@/components/base/cz.footer.vue'
  import CzHeaderNav from '@/components/base/cs.header-nav.vue'
  import Submission from '@/models/submission.model'
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
      await User.checkAuthorization()

      Submission.fetchSubmissions()
      // Zenodo.deleteAll()  // For testing
      if (User.isLoggedIn) {
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
