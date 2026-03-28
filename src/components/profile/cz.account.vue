<template>
  <div class="cz-account">
    <div class="text-h4">
      Account
    </div>
    <v-divider class="mb-4" />

    <p class="text-body-1 mb-8">
      The {{ $t("portalName") }} uses your ORCID account to manage and access
      data. If you are a developer, use this token to interact with the Data
      Submission Portal API.
    </p>

    <v-text-field
      label="Access token"
      :model-value="token"
      variant="outlined"
      readonly
      append-icon="mdi-content-copy"
      persi
      @click:append="onCopy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Notifications } from '@cznethub/cznet-vue-core'
import { useUserStore } from '~/stores/user.store'

const userStore = useUserStore()

const token = computed(() => userStore.orcidAccessToken)

function onCopy() {
  navigator.clipboard.writeText(token.value)
  Notifications.toast({ message: 'Copied to clipboard', type: 'info' })
}
</script>

<style lang="scss" scoped></style>
