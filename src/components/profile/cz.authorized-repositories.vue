<template>
  <div class="cz-authorized-repositories">
    <div class="text-h4">Authorized Repositories</div>
    <v-divider class="mb-8"></v-divider>

    <v-card v-for="repo of supportedRepositories" :key="repo.key" class="mb-6">
      <v-card-title :class="{'is-small': $vuetify.breakpoint.mdAndDown }">
        <span class="repo-name">{{ repo.name }}</span>
        <template v-if="getAccessToken(repo.key)">
          <div>
            <v-chip small color="green" outlined class="pl-0">
              <v-icon left class="ml-0">mdi-check-circle</v-icon>
              Authorized
            </v-chip>
          </div>
          <div class="text-right"><v-btn small>Revoke</v-btn></div>
        </template>
        <template v-else>
          <div>
            <v-chip small color="red" outlined>Unauthorized</v-chip>
          </div>
          <div class="text-right">
            <v-btn @click="openAuthorizePopup(repo.key)" color="primary">
              <i class="fas fa-key mr-2" />Authorize
            </v-btn>
          </div>
        </template>
      </v-card-title>
      <template v-if="getAccessToken(repo.key)">
        <v-divider></v-divider>
        <v-card-text >
          <v-text-field
            @click:append="onCopy(repo.key)"
            :label="repo.name + ' access token'"
            :value="getAccessToken(repo.key)"
            outlined
            readonly
            append-icon="mdi-content-copy"
            dense
            hide-details=""
          ></v-text-field>
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { mixins } from 'vue-class-component'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
  import { IRepository } from '../submissions/types'
  import CzNotification from '@/models/notifications.model'
  import Repository from '@/models/repository.model'

  @Component({
    name: 'cz-authorized-repositories',
    components: { },
  })
  export default class CzAuthorizedRepositories extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
    protected repoMetadata = repoMetadata

    protected get supportedRepositories(): IRepository[] {
      return Object.keys(repoMetadata)
        .map(key => repoMetadata[key])
        .filter(repo => !repo.isExternal && repo.isSupported)
    }

    protected getAccessToken(repositoryKey: string): string {
      return this.getRepositoryFromKey(repositoryKey)?.$state.accessToken
    }

    protected onCopy(repositoryKey: string) {
      navigator.clipboard.writeText(this.getAccessToken(repositoryKey))
      CzNotification.toast({ message: 'Copied to clipboard', type: 'info' })
    }

    protected async openAuthorizePopup(repositoryKey: string) {
      Repository.authorize(this.getRepositoryFromKey(repositoryKey) as typeof Repository)
    }
  }
</script>

<style lang="scss" scoped>
  .v-card__title {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    &.is-small {
      display: flex;
      flex-direction: column;
    }
  }
</style>
