<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Notifications } from '@cznethub/cznet-vue-core'
import User from '~/models/user.model'

@Component({
  name: 'cz-account',
  components: {},
})
export default class CzAccount extends Vue {
  protected get token() {
    return User.$state.orcidAccessToken
  }

  protected onCopy() {
    navigator.clipboard.writeText(this.token)
    Notifications.toast({ message: 'Copied to clipboard', type: 'info' })
  }
}
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
      outlined
      readonly
      append-icon="mdi-content-copy"
      @click:append="onCopy"
    />
  </div>
</template>

<style lang="scss" scoped></style>
