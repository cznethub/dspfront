<template>
  <div class="cz-authorize mb-2">
    <v-card class="text-center">
      <v-card-title class="v-card-media">
        <v-img :src="activeRepository.get().logoSrc" :alt="activeRepository.name" width="100%" height="8rem" contain />
      </v-card-title>
      <v-divider></v-divider>
      <v-card-title class="justify-center">
        <div class="text-h4">Submit to {{ activeRepository.name }}</div>
        <div class="text-body-1 mb-4">Permission is needed to post to this repository</div>
      </v-card-title>
      <v-card-text class="d-flex flex-column align-center">
        <v-btn @click="goToAuthorizePage()" color="primary" class="mb-4">
          <i class="fas fa-key mr-2" />Authorize
        </v-btn>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text>
        <p class="text-subtitle">Follow the instructions on the next page to allow CZnet to submit to this repository.</p>
      </v-card-text>
    </v-card>
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
  
  .v-card {
    max-width: 40rem;

    .v-card-media {
      background: linear-gradient(135deg, #f1f3f5 0%, #cfd8dc 100%);
    }

    .v-card-media {
      img {
        height: 100%;
        flex: 0;
      }
    }
  }
</style>
