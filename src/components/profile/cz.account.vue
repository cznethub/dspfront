<template>
  <div class="cz-account">
    <div class="text-h4">Account</div>
    <v-divider class="mb-4"></v-divider>

    <p class="text-body-1 mb-8">The Data Submission Portal uses your ORCID account to manage and access data. If you are a developer, use this token to interact with the Data Submission Portal API.</p>

    <v-text-field
      label="ORCID access token"
      :model-value="token"
      variant="outlined"
      readonly
      append-icon="mdi-content-copy"
      @click:append="onCopy"
    ></v-text-field>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-facing-decorator'
  import CzNotification from '@/models/notifications.model'
  import User from '@/models/user.model'

  @Component({
    name: 'cz-account',
    components: { },
  })
  export default class CzAccount extends Vue {
    protected get token() {
      return User.$state.orcidAccessToken
    }

    protected onCopy() {
      navigator.clipboard.writeText(this.token)
      CzNotification.toast({ message: 'Copied to clipboard', type: 'info' })
    }
  }
</script>

<style lang="scss" scoped>

</style>
