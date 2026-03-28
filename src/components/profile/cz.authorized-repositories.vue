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

    <v-card v-for="repo of supportedRepositories" :key="repo.key" class="my-12" border="thin grey" variant="outlined">
      <v-card-title :class="{ 'is-small': $vuetify.display.mdAndDown }" class="bg-grey-lighten-4">
        <span class="repo-name">{{ repo.name }}</span>
        <template v-if="getAccessToken(repo.key)">
          <div>
            <v-chip size="small" color="green" class="bg-white" variant="outlined" prepend-icon="mdi-check-circle">
              Authorized
            </v-chip>
          </div>
          <div class="text-right">
            <v-btn size="small" @click="openRevokeDialog(repo.key)">
              <v-icon size="small" class="mr-1">
                mdi-cancel
              </v-icon> Revoke
            </v-btn>
          </div>
        </template>
        <template v-else>
          <div>
            <v-chip size="small" color="red" class="bg-white" variant="outlined">
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
        <v-card-text class="py-8">
          <v-text-field
            :label="`${repo.name} access token`"
            :model-value="getAccessToken(repo.key)"
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

<script setup lang="ts">
import { computed } from 'vue'
import { Notifications } from '@cznethub/cznet-vue-core'
import { repoMetadata } from '~/components/submit/constants'
import { useRepositoryStore } from '~/stores/repository.store'
import { EnumRepositoryKeys } from '../submissions/types'

const repositoryStore = useRepositoryStore()

const supportedRepositories = computed(() =>
  Object.keys(repoMetadata)
    .map(key => repoMetadata[key])
    .filter(repo => !repo.isExternal && repo.isSupported?.form),
)

function getAccessToken(repositoryKey: string): string {
  return repositoryStore.getAccessToken(repositoryKey)
}

function onCopy(repositoryKey: string) {
  navigator.clipboard.writeText(getAccessToken(repositoryKey))
  Notifications.toast({ message: 'Copied to clipboard', type: 'info' })
}

function openAuthorizePopup(repositoryKey: string) {
  repositoryStore.openAuthorizeDialog(repositoryKey)
}

function openRevokeDialog(repositoryKey: string) {
  repositoryStore.openRevokeDialog(repositoryKey as EnumRepositoryKeys)
}
</script>

<style lang="scss" scoped>
.v-card {
  max-width: 40rem;
}

.v-card-title {
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
