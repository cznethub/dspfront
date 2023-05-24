<template>
  <div class="cz-authorized-repositories">
    <div class="text-h4">Authorized Repositories</div>
    <v-divider class="mb-4"></v-divider>

    <p class="text-body-1 mb-4">The Data Submission Portal needs your permission to access and interact with the repositories below.</p>

    <v-card v-for="repo of supportedRepositories" :key="repo.key" class="mb-6">
      <v-card-title :class="{'is-small': $vuetify.display.mdAndDown }">
        <span class="repo-name">{{ repo.name }}</span>
        <template v-if="getAccessToken(repo.key)">
          <div>
            <v-chip small color="green" variant="outlined" class="pl-0">
              <v-icon start class="ml-0">mdi-check-circle</v-icon>
              Authorized
            </v-chip>
          </div>
          <div class="text-right">
            <v-btn size="small" @click="openRevokeDialog(repo.key)"><v-icon size="small" class="mr-1">mdi-cancel</v-icon> Revoke</v-btn>
          </div>
        </template>
        <template v-else>
          <div>
            <v-chip small color="red" variant="outlined">Unauthorized</v-chip>
          </div>
          <div class="text-right">
            <v-btn color="primary" @click="openAuthorizePopup(repo.key)">
              <i class="fas fa-key mr-2" />Authorize
            </v-btn>
          </div>
        </template>
      </v-card-title>
      <template v-if="getAccessToken(repo.key)">
        <v-divider></v-divider>
        <v-card-text >
          <v-text-field
            :label="repo.name + ' access token'"
            :model-value="getAccessToken(repo.key)"
            variant="outlined"
            readonly
            append-icon="mdi-content-copy"
            density="compact"
            hide-details=""
            @click:append="onCopy(repo.key)"
          ></v-text-field>
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-facing-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
  import { IRepository } from '../submissions/types'
  import { getRepositoryFromKey } from '@/constants'
  import CzNotification from '@/models/notifications.model'
  import Repository from '@/models/repository.model'

  @Component({
    name: 'cz-authorized-repositories',
    components: { },
    mixins: [ActiveRepositoryMixin]
  })
  export default class CzAuthorizedRepositories extends Vue {
    protected repoMetadata = repoMetadata

    protected get supportedRepositories(): IRepository[] {
      return Object.keys(repoMetadata)
        .map(key => repoMetadata[key])
        .filter(repo => !repo.isExternal && repo.isSupported)
    }

    protected getAccessToken(repositoryKey: string): string {
      return getRepositoryFromKey(repositoryKey)?.$state.accessToken
    }

    protected onCopy(repositoryKey: string) {
      navigator.clipboard.writeText(this.getAccessToken(repositoryKey))
      CzNotification.toast({ message: 'Copied to clipboard', type: 'info' })
    }

    protected async openAuthorizePopup(repositoryKey: string) {
      Repository.authorize(getRepositoryFromKey(repositoryKey) as typeof Repository, () => {
        CzNotification.toast({
          message: 'Access to this repository has been authorized',
          type: 'success'
        })
      })
    }

    protected openRevokeDialog(repositoryKey: string) {
      Repository.openRevokeDialog(getRepositoryFromKey(repositoryKey) as typeof Repository)
    }
  }
</script>

<style lang="scss" scoped>
  .v-card {
    max-width: 40rem;
  }

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
