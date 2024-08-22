<template>
  <v-card
    class="cz-authorize d-flex flex-column flex-md-row"
    :class="{ 'is-medium': $vuetify.display.mdAndUp }"
  >
    <v-card min-width="15rem" class="d-flex flex-column darken-2 flex-grow-1 flex-shrink-0 flex-md-shrink-1" color="blue-grey" rounded="0">
      <v-card-title style="white-space: normal" class="pb-4">
        <v-icon color="white" class="mr-4">
          mdi-alert-circle
        </v-icon>
        <div>You must have a {{ repoName }} account before proceeding</div>
      </v-card-title>
      <v-card-text style="flex: 1 1 auto">
        If you do not have a {{ repoName }} account yet, create one in
        {{ repoName }} and then come back here to submit your content through
        the {{ $t("portalName") }}.
      </v-card-text>
    </v-card>

    <v-card style="flex-basis: 30rem" class="flex-grow-1 flex-md-shrink-0">
      <div class="v-card-media py-4 px-8">
        <img
          :src="repoLogoSrc"
          :alt="repoName"
          class="content-logo"
        >
      </div>

      <v-divider />
      <v-card-title class="justify-center text-center flex-column">
        <div class="text-h4 mt-2">
          Access {{ repoName }}
        </div>
        <div class="text-body-1 my-4">
          Permission is needed to access this repository
        </div>
      </v-card-title>
      <v-card-text class="d-flex flex-column align-center">
        <v-btn color="primary" class="mb-4" @click="openAuthorizePopup">
          <i class="fas fa-key mr-2" />Authorize
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-text class="text-center mt-4">
        <p class="text-subtitle">
          Follow the instructions on the next page to allow
          {{ $t("footer.orgName") }} to access this repository.
        </p>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, mixins, toNative } from 'vue-facing-decorator'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'
import { getRepositoryFromKey } from '~/constants'
import Repository from '~/models/repository.model'

@Component({
  name: 'cz-authorize',
  components: {},
})
class CzAuthorize extends mixins(ActiveRepositoryMixin) {
  @Prop() repo!: string

  get repository() {
    return getRepositoryFromKey(this.repo) as typeof Repository
  }

  get authorizeUrl() {
    return this.repository?.get()?.urls?.authorizeUrl
  }

  get repoLogoSrc() {
    return this.repository.get()?.logoSrc
  }

  get repoName() {
    return this.repository.get()?.name
  }

  async openAuthorizePopup() {
    Repository.authorize(this.repository, this.onAuthorized)
  }

  onAuthorized() {
    this.$emit('authorized')
  }
}
export default toNative(CzAuthorize)
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
  .v-card-title {
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

:deep(.v-card-media .content-logo) {
  width: 100%;
}
</style>
