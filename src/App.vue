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
  import axios from "axios"
  import Submission from '@/models/submission.model'
  
  @Component({
    name: 'app',
    components: { CzFooter, CzHeaderNav },
  })
  export default class App extends Vue {
    protected isLoading = true

    created() {
      document.title = 'CZ Hub';
      this.checkAuthorization()
      this.loadSubmissions()
    }

    async checkAuthorization() {
      const status = await axios.get("/api")
        // .then((resp) => {
          //   return true;
        // })
        // .catch((error) => {
          //   return false;
        // })
      console.log(status)
    }

    loadSubmissions() {
      Submission.fetchSubmissions()
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
