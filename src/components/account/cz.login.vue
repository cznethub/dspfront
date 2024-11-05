<template>
  <v-card class="cz-login">
    <v-card-title>Log In</v-card-title>
    <v-card-text>
      <p class="text-body-1">
        User accounts in the {{ $t("portalName") }} are managed using your
        ORCID® iD. An ORCID iD is a persistent digital identifier that you own
        and control and that distinguishes you from every other researcher.
      </p>
      <br>
      <p class="text-body-1">
        If you have an ORCID already, click the button below to get started. If
        you don't have an ORCID yet, getting one is easy. Visit
        <a href="https://orcid.org" target="_blank">https://orcid.org</a> to
        register and get your unique ORCID iD.
      </p>
      <img src="/img/orcid.png" alt="ORCID">
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn variant="elevated" elevation="1" @click="onCancel">
        Cancel
      </v-btn>
      <v-btn
        id="orcid_login_continue"
        variant="elevated"
        color="primary"
        @click="openLogInDialog()"
      >
        <i class="fab fa-orcid fa-lg mr-2" aria-hidden="true" />
        <span>Log In Using ORCID</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'
import User from '~/models/user.model'

@Component({
  name: 'cz-login',
  components: {},
  emits: ['loggedIn', 'cancel'],
})
class CzLogin extends Vue {
  async openLogInDialog() {
    User.logIn(this.onLoggedIn)
  }

  onCancel() {
    this.$emit('cancel')
  }

  onLoggedIn() {
    this.$emit('loggedIn')
  }
}
export default toNative(CzLogin)
</script>

<style lang="scss" scoped>
:deep(.v-card-text img) {
  max-width: 12rem;
}
</style>
