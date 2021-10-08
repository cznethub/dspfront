<template>
  <div class="main-container">
    <cz-header-nav />
    <router-view name="content" class="main-content" />
    <router-view name="footer" />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import CzFooter from '@/components/base/cz.footer.vue'
  import CzHeaderNav from '@/components/base/cs.header-nav.vue'
  import Submission from '@/models/submission.model'
  import User from '@/models/user.model'
  
  @Component({
    name: 'app',
    components: { CzFooter, CzHeaderNav },
  })
  export default class App extends Vue {
    protected isLoading = true

    created() {
      document.title = 'CZ Hub';
      Submission.fetchSubmissions()
      // if (User.isLoggedIn) {
        User.checkAuthorization()
      // }
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
