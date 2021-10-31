<template>
  <section class="cz-login md-layout md-alignment-center-center" style="flex-direction: column;">
    <h1 class="md-display-1 has-space-top-2x">Critical Zone Collaborative Network</h1>
    <h3 class="has-text-mute has-space-bottom md-headline has-space-top">Data Submission Portal</h3>

    <md-card class="panel has-space-top-2x md-elevation-2">
      <md-toolbar class="md-accent" md-elevation="0">
        <span class="md-title">Log In</span>
      </md-toolbar>

      <div class="panel-content has-space-bottom md-layout md-alignment-center-center" style="flex-direction: column;">
        <md-button @click="goToOrcidLogin()" class="md-raised md-primary full-width">
          <i class="fab fa-orcid has-space-right is-size-3" />
          <span>Log In Using ORCID</span>
        </md-button>
        <p class="">User accounts in the Data Submission Portal are managed using your ORCID® iD. An ORCID iD is a persistent digital identifier that you own and control and that distinguishes you from every other researcher.</p>
        <p class="">If you have an ORCID already, click the button above to get started. If you don't have an ORCID yet, getting one is easy. Visit <a href="https://orcid.org" target="_blank">https://orcid.org</a> to register and get your unique ORCID iD.</p>
        <img class="md-size-75 md-layout-item" :src="require('@/assets/img/orcid.png')" alt="ORCID">
      </div>
    </md-card>
  </section>
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
    padding: 2rem 0;
  }

  .panel {
    width: 40rem;
    max-width: 100%;
    margin: 0;
  }

  .panel-content {
    padding: 2rem;
  }
</style>
