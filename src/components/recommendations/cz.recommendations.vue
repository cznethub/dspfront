<template>
  <div class="cz-recommendations">
    <div class="banner has-text-centered">
      <h1 class="has-space-bottom md-display-1">Repository Recommendations</h1>
      <h3 class="md-headline">Find the Best Repository for Your Research Products</h3>
    </div>

    <section>
      <div id="options-grid" class="">
        <v-card class="md-layout-item md-small-size-100 md-primary" md-theme="grey-card" md-with-hover>
          <div class="has-text-centered">
          <v-icon class="md-size-2x md-layout-item">add_circle_outline</v-icon>
          <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">I have geospatial data</h3>
          <p class="has-text-mute has-text-centered">Learn more about formats, best practices, and repositories for geospatial data.</p>
          </div>
        </v-card>

        <v-card class="md-layout-item md-small-size-100 md-primary" md-theme="grey-card" md-with-hover>
          <div class="has-text-centered">
          <v-icon class="md-size-2x md-layout-item">add_circle_outline</v-icon>
          <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">My data are derived from

physical samples</h3>
          <p class="has-text-mute has-text-centered">Learn more about registering physical samples and submitting data derived from samples.</p>
          </div>
        </v-card>

        <v-card class="md-layout-item md-small-size-100 md-primary" md-theme="grey-card" md-with-hover>
          <div class="has-text-centered">
          <v-icon class="md-size-2x md-layout-item">add_circle_outline</v-icon>
          <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">I want to submit multiple

types of data together</h3>
          <p class="has-text-mute has-text-centered">Learn more about best practices for assembling multiple datasets for a project or publication. </p>
          </div>
        </v-card>
      </div>
    </section>

    <hr>

    <section class="has-text-centered">
      <h1 class="has-space-bottom-2x md-display-1">Not Sure? Let us Help You Decide</h1>
      <p class="has-text-mute has-space-bottom-2x">Click the button below to begin an interactive questionnaire that will help us identify which data formats, best practices, and repository is right for your data. </p>
      <v-btn class="md-raised md-accent">Repository Recommendations</v-btn>
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-recommendations',
    components: { },
  })
  export default class CzRecommendations extends Vue {

  }
</script>

<style lang="scss" scoped>
  $md-padding: 17px;

  #options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(35rem, 1fr));
    gap: 2rem;
  }

  .banner {
    padding: 6rem 4rem;
    background: #cfd8dc3b;
    margin: -$md-padding;
    margin-bottom: 0;
  }
</style>
