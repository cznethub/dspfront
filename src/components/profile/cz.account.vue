<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'
import { Notifications } from '@cznethub/cznet-vue-core'
import User from '~/models/user.model'

@Component({
  name: 'cz-account',
  components: {},
})
class CzAccount extends Vue {
  get token() {
    return User.$state.orcidAccessToken
  }

  onCopy() {
    navigator.clipboard.writeText(this.token)
    Notifications.toast({ message: 'Copied to clipboard', type: 'info' })
  }
}
export default toNative(CzAccount)
</script>

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
      :value="token"
      variant="outlined"
      readonly
      append-icon="mdi-content-copy"
      @click:append="onCopy"
    />
  </div>
</template>

<style lang="scss" scoped></style>
