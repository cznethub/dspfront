<template>
  <div class="cz-account">
    <div class="text-h4">Account</div>
    <v-divider class="mb-8"></v-divider>

    <v-text-field
      label="ORCID access token"
      :value="token"
      outlined
      readonly
      append-icon="mdi-content-copy"
      ref="inputToken"
      @click:append="onCopy"
    ></v-text-field>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
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
