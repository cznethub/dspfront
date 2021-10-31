<template>
  <div class="cz-authorize section">
    <div class="container">
      <div class="is-flex is-flex-direction-column is-align-items-center">
        <h1 class="title is-1">Submit to {{ activeRepository.name }}</h1>
        <h3 class="has-text-mute has-space-bottom">Permission is needed to post to this repository</h3>

        <div class="panel has-space-bottom-2x">
          <div class="panel-heading">Authorize</div>
          <div class="panel-block is-flex is-flex-direction-column has-space-bottom">
            <b-button @click="goToAuthorizePage()" size="is-medium" expanded type="is-primary">
              <div class="level">
                <i class="fas fa-key has-space-right is-size-3" />
                <span>Authorize</span>
              </div>
            </b-button>
            <p class="block has-text-mute">Follow the instructions on the next page to allow CZnet to submit to this repository.</p>
          </div>
        </div>
      </div>
    </div>
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
        case EnumRepositoryKeys.hydroShare: return HydroShare
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
  .panel {
    max-width: 40rem;
  }

  .panel-heading {
    text-align: center;
  }
</style>
