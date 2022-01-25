<template>
  <v-container class="cz-contact">
    <div class="text-h4">How to Contact Us</div>
    <v-divider class="has-space-bottom" />

    <p class="has-space-bottom-2x text-subtitle-1">If you need help with data management or have questions about the guidance provided here, you can contact us in a number of ways.</p>

    <div class="text-h6 has-space-bottom">Join Us in the CZNet Slack Workspace</div>

    <p class="text-body-1">
      The CZNet Slack workspace was established to foster communication between the thematic clusters and with the CZNet Hub team. If you haven’t joined the CZNet Slack workspace, we encourage you to join us there. There are specific channels set up within the workspace for topical discussions. If you would like to join the CZNet Slack workspace, please email us at cznet@cuahsi.org.
    </p>

    <div class="text-h6 has-space-bottom">Contact Us Directly via Email</div>
    
    <p class="text-body-1">
      For specific questions about CZNet data management, please contact us at <a href="mailto:cznet@cuahsi.org?subject=(CZNet)">cznet@cuahsi.org</a>. Be sure to include “CZNet” in the subject line of the email you send. We will route these emails to the person(s) who we think can best answer your questions.
    </p>
  </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-contact',
    components: { },
  })
  export default class CzContact extends Vue {

  }
</script>

<style lang="scss" scoped>
  .cz-contact {
    // padding: 1rem;
  }
</style>
