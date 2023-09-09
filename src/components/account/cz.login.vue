<template>
  <v-card class="cz-login">
    <v-card-title>Log In</v-card-title>
    <v-card-text>
      <p class="text-body-1">
        User accounts in the {{ $t("portalName") }} are managed using your
        ORCID® iD. An ORCID iD is a persistent digital identifier that you own
        and control and that distinguishes you from every other researcher.
      </p>
      <p class="text-body-1">
        If you have an ORCID already, click the button below to get started. If
        you don't have an ORCID yet, getting one is easy. Visit
        <a href="https://orcid.org" target="_blank">https://orcid.org</a> to
        register and get your unique ORCID iD.
      </p>
      <img :src="require('@/assets/img/orcid.png')" alt="ORCID" />
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="onCancel">Cancel</v-btn>
      <v-btn
        id="orcid_login_continue"
        @click="openLogInDialog()"
        color="primary"
      >
        <v-icon class="mr-2">fab fa-orcid</v-icon>
        <span>Log In Using ORCID</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import User from "@/models/user.model";

@Component({
  name: "cz-login",
  components: {},
})
export default class CzLogin extends Vue {
  protected async openLogInDialog() {
    User.logIn(this.onLoggedIn);
  }

  protected onCancel() {
    this.$emit("cancel");
  }

  protected onLoggedIn() {
    this.$emit("logged-in");
  }
}
</script>

<style lang="scss" scoped>
::v-deep .v-card__text img {
  max-width: 12rem;
}
</style>
