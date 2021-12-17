<template>
  <footer class="cz-footer has-text-mute-darker d-flex flex-column align-center full-width body-2">
    <v-container>
      <div class="d-lg-flex justify-space-between full-width">
        <div class="has-space-bottom-2x">
          <h3 class="has-space-bottom">Contact Us</h3>
          <router-link to="/contact">Contact</router-link>
          <p>Learn more about the <a href="#">CZCN</a> and <a href="#">CZ Hub</a></p>
          <p>Visit <a href="#">cuahsi.org</a></p>
        </div>

        <div class="has-space-bottom-2x">
          <h3 class="has-space-bottom">Get Started</h3>
          <router-link to="/login">Log In</router-link>
        </div>

        <div>
          <h3 class="has-space-bottom">Open Source</h3>
          <p>The Data Submission Portal is Open Source. Find us on GitHub.</p>
          <p>Report a bug <a href="#">here</a></p>
          <p>This is Version X.X.X of the Data Submission Portal</p>
        </div>
      </div>

      <div class="has-text-centered d-flex flex-column align-center has-space-top-2x">
        <p>(c) 2021 CUAHSI. ﻿This material is based upon work supported by the National Science Foundation (NSF) under awards 2012893, 2012593, and 2012748.<br>
        Any opinions, findings, conclusions, or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the NSF.</p>
      </div>
    </v-container>
  </footer>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-footer',
    components: { },
  })
  export default class CzFooter extends Vue {

  }
</script>

<style lang="scss" scoped>
  .cz-footer {
    padding: 2rem 0;
  }
</style>
