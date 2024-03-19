<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import User from '~/models/user.model'

@Component({
  name: 'cz-footer',
  components: {},
})
export default class CzFooter extends Vue {
  protected openLogInDialog() {
    User.openLogInDialog()
  }

  protected get isLoggedIn() {
    return User.$state.isLoggedIn
  }

  protected get version() {
    return import.meta.env.VITE_APP_VERSION || '0'
  }

  protected get year() {
    return new Date().getFullYear()
  }
}
</script>

<template>
  <v-container
    flat
    class="cz-footer font-weight-light d-flex flex-column align-center full-width text-body-2"
  >
    <div class="d-lg-flex justify-space-between full-width">
      <div class="mb-4">
        <div class="mb-2 text-h6">
          Contact Us
        </div>
        <router-link to="/contact">
          Contact
        </router-link>
        <p>
          Learn more about the
          <a :href="`${$t('footer.orgLink')}`" target="_blank">{{
            $t("footer.orgName")
          }}</a>
          and
          <a :href="`${$t('footer.hubLink')}`" target="_blank">{{
            $t("hubName")
          }}</a>
        </p>
        <p>
          Visit <a href="https://www.cuahsi.org/" target="_blank">cuahsi.org</a>
        </p>
      </div>

      <div class="mb-4">
        <div class="mb-2 text-h6">
          Get Started
        </div>
        <a v-if="!isLoggedIn" href="#" @click="openLogInDialog()">Log In</a>
        <router-link v-else to="/submit">
          Submit Data
        </router-link>
      </div>

      <div>
        <div class="mb-2 text-h6">
          Open Source
        </div>
        <p>
          The {{ $t("portalName") }} is Open Source. Find us on
          <a :href="`${$t('footer.repoUrl')}`" target="_blank">GitHub</a>.
        </p>
        <p>
          Report a bug
          <a :href="`${$t('footer.reportIssuesUrl')}`" target="_blank">here</a>
        </p>
        <p>This is Version {{ version }} of the {{ $t("portalName") }}</p>
      </div>
    </div>

    <v-divider />

    <div class="text-center d-flex flex-column align-center mt-4">
      <p>
        (c) {{ year }} CUAHSI. ﻿This material is based upon work supported by
        the National Science Foundation (NSF) under awards 2012893, 2012593, and
        2012748.<br>
        Any opinions, findings, conclusions, or recommendations expressed in
        this material are those of the authors and do not necessarily reflect
        the views of the NSF.
      </p>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.cz-footer {
  padding: 2rem 0;
}
</style>
