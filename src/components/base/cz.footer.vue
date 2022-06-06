<template>
  <v-container flat class="cz-footer text--secondary d-flex flex-column align-center full-width body-2">
    <div class="d-lg-flex justify-space-between full-width">
      <div class="has-space-bottom-2x">
        <div class="has-space-bottom text-h6">Help</div>
        <a href="https://help.hydroshare.org/" target="_blank">HydroShare Help Pages</a>
      </div>

      <div class="has-space-bottom-2x">
        <div class="has-space-bottom text-h6">Get Started</div>
        <a v-if="!isLoggedIn" @click="openLogInDialog()">Log In</a>
        <a v-else href="https://help.hydroshare.org/creating-and-managing-resources/" target="_blank">Uploading and Publishing Data and Models</a>
        <!-- <router-link v-else to="/submit">Submit Data</router-link> -->
      </div>

      <div>
        <div class="has-space-bottom text-h6">Open Source</div>
        <p>Report a bug <a href="https://github.com/hydroshare/hydroshare/issues" target="_blank">here</a></p>
        <p>This is Version X.X.X of HydroShare</p>
      </div>
    </div>

    <v-divider></v-divider>

    <div class="text-center d-flex flex-column align-center has-space-top-2x">
      <p>© 2016 CUAHSI. This material is based upon work supported by the National Science Foundation (NSF) under awards 1148453, 1148090, 1664018, 1664061, 1338606, and 1664119. Any opinions, findings, conclusions, or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the NSF.</p>
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
  }
</script>

<style lang="scss" scoped>
  .cz-footer {
    padding: 2rem 0;
  }
</style>
