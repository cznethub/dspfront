<template>
  <v-card class="cz-authorize">
    <div class="v-card-media py-4 px-8">
      <v-img :src="repoLogoSrc" :alt="activeRepository.name" width="100%" height="8rem" contain />
    </div>
    <v-divider></v-divider>
    <v-card-title class="justify-center">
      <div class="text-h4 mt-2">Submit to {{ activeRepository.name }}</div>
      <div class="text-body-1 mb-4">Permission is needed to post to this repository</div>
    </v-card-title>
    <v-card-text class="d-flex flex-column align-center">
      <v-btn @click="openAuthorizeDialog()" color="primary" class="mb-4">
        <i class="fas fa-key mr-2" />Authorize
      </v-btn>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text class="text-center mt-4">
      <p class="text-subtitle">Follow the instructions on the next page to allow CZnet to submit to this repository.</p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator'
  import { mixins } from 'vue-class-component'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
  import Repository from '@/models/repository.model'

  @Component({
    name: 'cz-authorize',
    components: { },
  })
  export default class CzAuthorize extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
    protected get authorizeUrl() {
      return this.activeRepository?.get()?.urls?.authorizeUrl
    }

    protected get repoLogoSrc() {
      return this.activeRepository.get()?.logoSrc
    }

    protected async openAuthorizeDialog() {
      Repository.authorize(this.activeRepository, this.onAuthorized)
    }

    protected onAuthorized() {
      this.$emit('authorized')
    }
  }
</script>

<style lang="scss" scoped>
  .v-card {
    .v-card-media {
      background: linear-gradient(135deg, #f1f3f5 0%, #cfd8dc 100%);
      img {
        height: 100%;
        flex: 0;
      }
    }
  }
</style>
