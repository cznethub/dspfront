<template>
  <div class="cz-login d-flex">
    <div id="panel-left" class="text-center has-text-shadow hidden-sm-and-down"
      :style="{ 'background-image': 'linear-gradient(rgb(0 52 82 / 31%), rgba(0, 0, 0, 0)), url(' + require('@/assets/img/bg-3.png') + ')' }">
      <div class="has-text-white text-h4">Critical Zone Collaborative Network</div>
      <div class="has-space-bottom has-space-top has-text-white text-h5">Data Submission Portal</div>
    </div>

    <div id="panel-right" class="body-1">
      <div class="text-h4 has-space-bottom">Log In</div>

      <v-btn @click="goToOrcidLogin()" class="has-space-bottom-2x" color="primary">
        <v-icon class="has-space-right">fab fa-orcid</v-icon>
        <span>Log In Using ORCID</span>
      </v-btn>
      <p class="text-body-1">User accounts in the Data Submission Portal are managed using your ORCID® iD. An ORCID iD is a persistent digital identifier that you own and control and that distinguishes you from every other researcher.</p>
      <p class="text-body-1">If you have an ORCID already, click the button above to get started. If you don't have an ORCID yet, getting one is easy. Visit <a href="https://orcid.org" target="_blank">https://orcid.org</a> to register and get your unique ORCID iD.</p>
      <img :src="require('@/assets/img/orcid.png')" alt="ORCID">
    </div>
  </div>
</template>

<script lang="ts">
  import { saveNextRoute } from '@/router'
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-login',
    components: { },
  })
  export default class CzLogin extends Vue {
    protected goToOrcidLogin() {
      saveNextRoute()
      window.location.replace('/api/login')
    }
  }
</script>

<style lang="scss" scoped>
  .cz-login {
    min-height: 50rem;
  }

  #panel-left {
    padding-top: 8rem;
    background-size: cover;
    flex: 3;
  }

  #panel-right {
    flex: 1;
    padding: 2rem;

    img {
      max-width: 15rem;
    }
  }
</style>
