<script lang="ts">
import { Component, mixins, toNative } from 'vue-facing-decorator'
import { Notifications } from '@cznethub/cznet-vue-core'
import type { IRepository } from '../submissions/types'
import { repoMetadata } from '~/components/submit/constants'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'
import { getRepositoryFromKey } from '~/constants'
import Repository from '~/models/repository.model'

@Component({
  name: 'cz-authorized-repositories',
  components: {},
})
class CzAuthorizedRepositories extends mixins(ActiveRepositoryMixin) {
  repoMetadata = repoMetadata

  get supportedRepositories(): IRepository[] {
    return Object.keys(repoMetadata)
      .map(key => repoMetadata[key])
      .filter(repo => !repo.isExternal && repo.isSupported)
  }

  getAccessToken(repositoryKey: string): string {
    return getRepositoryFromKey(repositoryKey)?.$state.accessToken
  }

  onCopy(repositoryKey: string) {
    navigator.clipboard.writeText(this.getAccessToken(repositoryKey))
    Notifications.toast({ message: 'Copied to clipboard', type: 'info' })
  }

  async openAuthorizePopup(repositoryKey: string) {
    Repository.openAuthorizeDialog(repositoryKey)
  }

  openRevokeDialog(repositoryKey: string) {
    Repository.openRevokeDialog(
      getRepositoryFromKey(repositoryKey) as typeof Repository,
    )
  }
}
export default toNative(CzAuthorizedRepositories)
</script>

<template>
  <div class="cz-authorized-repositories">
    <div class="text-h4">
      Authorized Repositories
    </div>
    <v-divider class="mb-4" />

    <p class="text-body-1 mb-4">
      The {{ $t("portalName") }} needs your permission to access and interact
      with the repositories below.
    </p>

    <v-card v-for="repo of supportedRepositories" :key="repo.key" class="mb-6">
      <v-card-title :class="{ 'is-small': $vuetify.display.mdAndDown }">
        <span class="repo-name">{{ repo.name }}</span>
        <template v-if="getAccessToken(repo.key)">
          <div>
            <v-chip small color="green" variant="outlined" class="pl-0">
              <v-icon left class="ml-0">
                mdi-check-circle
              </v-icon>
              Authorized
            </v-chip>
          </div>
          <div class="text-right">
            <v-btn small @click="openRevokeDialog(repo.key)">
              <v-icon small class="mr-1">
                mdi-cancel
              </v-icon> Revoke
            </v-btn>
          </div>
        </template>
        <template v-else>
          <div>
            <v-chip small color="red" variant="outlined">
              Unauthorized
            </v-chip>
          </div>
          <div class="text-right">
            <v-btn color="primary" @click="openAuthorizePopup(repo.key)">
              <i class="fas fa-key mr-2" />Authorize
            </v-btn>
          </div>
        </template>
      </v-card-title>
      <template v-if="getAccessToken(repo.key)">
        <v-divider />
        <v-card-text>
          <v-text-field
            :label="`${repo.name} access token`"
            :value="getAccessToken(repo.key)"
            variant="outlined"
            readonly
            append-icon="mdi-content-copy"
            density="compact"
            hide-details
            @click:append="onCopy(repo.key)"
          />
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

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
