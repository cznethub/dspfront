<template>
  <v-container flat class="cz-footer text--secondary d-flex flex-column align-center full-width body-2">
    <div class="d-lg-flex justify-space-between full-width">
      <div class="has-space-bottom-2x">
        <div class="has-space-bottom text-h6">Contact Us</div>
        <router-link to="/contact">Contact</router-link>
        <p>Learn more about the <a href="https://www.criticalzone.org/"
          target="_blank">CZNet</a> and <a href="https://criticalzone.org/hub" target="_blank">CZ Hub</a></p>
        <p>Visit <a href="https://www.cuahsi.org/" target="_blank">cuahsi.org</a></p>
      </div>

      <div class="has-space-bottom-2x">
        <div class="has-space-bottom text-h6">Get Started</div>
        <a v-if="!isLoggedIn" @click="openLogInDialog()">Log In</a>
        <router-link v-else to="/submit">Submit Data</router-link>
      </div>

      <div>
        <div class="has-space-bottom text-h6">Open Source</div>
        <p>The Data Submission Portal is Open Source. Find us on <a href="https://github.com/cznethub/dsp" target="_blank">GitHub</a>.</p>
        <p>Report a bug <a href="https://github.com/cznethub/dsp/issues" target="_blank">here</a></p>
        <p>This is Version {{ version }} of the Data Submission Portal</p>
      </div>
    </div>

    <v-divider></v-divider>

    <div class="text-center d-flex flex-column align-center has-space-top-2x">
      <p>(c) {{year}} CUAHSI. ﻿This material is based upon work supported by the National Science Foundation (NSF) under awards 2012893, 2012593, and 2012748.<br>
      Any opinions, findings, conclusions, or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the NSF.</p>
    </div>
  </v-container>
</template>

<script lang="ts">
  import User from '@/models/user.model'
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-footer',
    components: { },
  })
  export default class CzFooter extends Vue {
    protected openLogInDialog() {
      User.openLogInDialog()
    }

    protected get isLoggedIn() {
      return User.$state.isLoggedIn;
    }

    protected get version() {
      return process.env.VUE_APP_VERSION || '0'
    }

    protected get year() {
      return (new Date()).getFullYear()
    }
  }
</script>

<style lang="scss" scoped>
  .cz-footer {
    padding: 2rem 0;
  }
</style>
