<template>
  <div class="cz-login md-layout md-alignment-center-center">
    <div id="panel-left" class="md-layout-item has-text-centered md-small-hide has-text-shadow"
      :style="{ 'background-image': 'linear-gradient(rgb(0 52 82 / 31%), rgba(0, 0, 0, 0)), url(' + require('@/assets/img/bg-3.png') + ')' }">
      <h1 class="md-display-1 has-text-white">Critical Zone Collaborative Network</h1>
      <h3 class="has-text-mute has-space-bottom md-headline has-space-top has-text-white">Data Submission Portal</h3>
    </div>

    <div id="panel-right" class="md-layout-item md-layout md-alignment-center-center">
      <div class="md-title has-space-bottom">Log In</div>

      <md-button @click="goToOrcidLogin()" class="md-raised md-accent has-space-bottom-2x">
        <i class="fab fa-orcid has-space-right is-size-3" />
        <span>Log In Using ORCID</span>
      </md-button>
      <p class="">User accounts in the Data Submission Portal are managed using your ORCID® iD. An ORCID iD is a persistent digital identifier that you own and control and that distinguishes you from every other researcher.</p>
      <p class="">If you have an ORCID already, click the button above to get started. If you don't have an ORCID yet, getting one is easy. Visit <a href="https://orcid.org" target="_blank">https://orcid.org</a> to register and get your unique ORCID iD.</p>
      <img class="md-size-60 md-layout-item" :src="require('@/assets/img/orcid.png')" alt="ORCID">
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
    margin: -17px;
    height: calc(100% + 34px);
  }

  #panel-left {
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  #panel-left {
    padding-top: 8rem;
    background-size: cover;
  }

  #panel-right {
    max-width: 50rem;
    padding: 4rem;
    flex-direction: column;
  }
</style>
