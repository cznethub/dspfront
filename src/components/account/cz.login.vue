<template>
  <v-card class="cz-login">
    <v-card-title>Log In</v-card-title>
    <v-card-text>
      <p class="text-body-1">User accounts in the Data Submission Portal are managed using your ORCID® iD. An ORCID iD is a persistent digital identifier that you own and control and that distinguishes you from every other researcher.</p>
      <p class="text-body-1">If you have an ORCID already, click the button above to get started. If you don't have an ORCID yet, getting one is easy. Visit <a href="https://orcid.org" target="_blank">https://orcid.org</a> to register and get your unique ORCID iD.</p>
      <img :src="require('@/assets/img/orcid.png')" alt="ORCID">
    </v-card-text>
      <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="onCancel">Cancel</v-btn>
      <v-btn @click="openLogInDialog()" color="primary">
        <v-icon class="mr-2">fab fa-orcid</v-icon>
        <span>Log In Using ORCID</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
  import User from '@/models/user.model'
  import { Component, Vue } from 'vue-property-decorator'
import { RawLocation } from 'vue-router'

  @Component({
    name: 'cz-login',
    components: { },
  })
  export default class CzLogin extends Vue {
    protected async openLogInDialog() {
      User.logIn(this.onLoggedIn) // Close the popup window once logged in
    }

    protected onCancel() {
      this.$emit('cancel')
    }

    protected onLoggedIn(redirectTo?: RawLocation) {
      this.$emit('logged-in')
    }
  }
</script>

<style lang="scss" scoped>
  .cz-login {
    // min-height: 50rem;
  }

  ::v-deep .v-card__text img {
    max-width: 12rem;
  }
</style>
