<template>
  <v-card class="cz-authorize d-flex flex-column flex-md-row"
    :class="{ 'is-medium': $vuetify.breakpoint.mdAndUp }">
    <v-card class="d-flex flex-column darken-2" color="blue-grey" rounded="0">
      <v-card-title class="white--text">
        <v-icon color="white" class="mr-4">mdi-alert-circle</v-icon>
        <div>You must have a {{ repoName }} account before proceeding</div>
      </v-card-title>
      <v-card-text class="white--text">If you do not have a {{ repoName }} account yet, create one in {{ repoName }} and then come back here to submit your content through the Data Submission Portal.</v-card-text>
    </v-card>
    <v-card elevation="0">
      <div class="v-card-media py-4 px-8">
        <v-img :src="repoLogoSrc" :alt="repoName" content-class="content-logo" width="100%" height="8rem" contain />
      </div>
      
      <v-divider></v-divider>
      <v-card-title class="justify-center text-center">
        <div class="text-h4 mt-2">Access {{ repoName }}</div>
        <div class="text-body-1 my-4">Permission is needed to access this repository</div>
      </v-card-title>
      <v-card-text class="d-flex flex-column align-center">
        <v-btn @click="openAuthorizePopup" color="primary" class="mb-4">
          <i class="fas fa-key mr-2" />Authorize
        </v-btn>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text class="text-center mt-4">
        <p class="text-subtitle">Follow the instructions on the next page to allow CZnet to access this repository.</p>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator'
  import { mixins } from 'vue-class-component'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
  import { getRepositoryFromKey } from '@/constants'
  import Repository from '@/models/repository.model'

  @Component({
    name: 'cz-authorize',
    components: { },
  })
  export default class CzAuthorize extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
    @Prop() repo!: string

    protected get repository() {
      return getRepositoryFromKey(this.repo) as typeof Repository
    }

    protected get authorizeUrl() {
      return this.repository?.get()?.urls?.authorizeUrl
    }

    protected get repoLogoSrc() {
      return this.repository.get()?.logoSrc
    }

    protected get repoName() {
      return this.repository.get()?.name
    }

    protected async openAuthorizePopup() {
      Repository.authorize(this.repository, this.onAuthorized)
    }

    protected onAuthorized() {
      this.$emit('authorized')
    }
  }
</script>

<style lang="scss" scoped>
  .cz-authorize.is-medium {
    & > .v-card:first-child {
      max-width: 14rem;
      // text-align: right;

      // .v-card-title {
      //   justify-content: flex-end;
      // }
    }
  }

  .v-card {
    .v-card__title {
      word-break: break-word;
    }

    .v-card-media {
      background: linear-gradient(135deg, #f1f3f5 0%, #cfd8dc 100%);
      img {
        height: 100%;
        flex: 0;
      }
    }
  }

  ::v-deep .v-card-media .content-logo {
    width: auto !important;
  }
</style>
