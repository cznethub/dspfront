<template>
  <div class="cz-authorize">
    <md-card class="has-text-centered">
      <md-card-media class="md-layout md-alignment-center-center" style="height: 10rem; padding: 2rem;">
        <img :src="activeRepository.get().logoSrc" :alt="activeRepository.name" class="md-layout-item">
      </md-card-media>
      <md-card-header class="">
        <div class="md-title">Submit to {{ activeRepository.name }}</div>
        <div class="md-subhead">Permission is needed to post to this repository</div>
      </md-card-header>
      <md-card-content class="">
        <v-btn @click="goToAuthorizePage()" class="md-raised md-accent">
          <div class="level">
            <i class="fas fa-key has-space-right is-size-3" />
            <span>Authorize</span>
          </div>
        </v-btn>
        <p class="">Follow the instructions on the next page to allow CZnet to submit to this repository.</p>
      </md-card-content>
    </md-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { EnumRepositoryKeys } from '../submissions/types'
  import { saveNextRoute } from '@/router'
  import Repository from '@/models/repository.model'
  import HydroShare from '@/models/hydroshare.model'
  import Zenodo from '@/models/zenodo.model'

  @Component({
    name: 'cz-authorize',
    components: { },
  })
  export default class CzAuthorize extends Vue {
    protected get authorizeUrl() {
      return this.activeRepository?.get()?.urls?.authorizeUrl
    }

    // TODO: add to a mixin and reuse
    protected get activeRepository() {
      const key = Repository.$state.submittingTo
      switch (key) {
        case EnumRepositoryKeys.hydroshare: return HydroShare
        case EnumRepositoryKeys.zenodo: return Zenodo
        default: return Zenodo
      }
    }

    protected goToAuthorizePage() {
      if (this.authorizeUrl) {
        saveNextRoute()
        window.location.replace(this.authorizeUrl)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .cz-authorize {
    padding-top: 4rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: 100%;
  }
  
  .md-card {
    max-width: 40rem;

    .md-card-media {
      background: linear-gradient(135deg, #f1f3f5 0%, var(--md-theme-default-primary) 100%);

      img {
        height: 100%;
        flex: 0;
      }
    }
  }
</style>
