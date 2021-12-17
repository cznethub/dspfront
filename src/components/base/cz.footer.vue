<template>
  <footer class="cz-footer has-text-mute-darker " style="flex-direction: column;">
    <div class="footer-top   content">
      <section class=" ">
        <h3 class=" has-space-bottom">Contact Us</h3>
        <router-link to="/contact">Contact</router-link>
        <p>Learn more about the <a href="#">CZCN</a> and <a href="#">CZ Hub</a></p>
        <p>Visit <a href="#">cuahsi.org</a></p>
      </section>

      <section class=" ">
        <h3 class=" has-space-bottom">Get Started</h3>
        <router-link to="/login">Log In</router-link>
      </section>

      <section class=" ">
        <h3 class=" has-space-bottom">Open Source</h3>
        <p>The Data Submission Portal is Open Source. Find us on GitHub.</p>
        <p>Report a bug <a href="#">here</a></p>
        <p>This is Version X.X.X of the Data Submission Portal</p>
      </section>
    </div>

    <div class="has-text-centered  content">
      <p>(c) 2021 CUAHSI. ﻿This material is based upon work supported by the National Science Foundation (NSF) under awards 2012893, 2012593, and 2012748.</p>
      <p>Any opinions, findings, conclusions, or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the NSF. </p>
    </div>
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
  }
</style>
