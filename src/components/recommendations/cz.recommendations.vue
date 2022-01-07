<template>
  <div class="cz-recommendations">
    <div class="banner has-text-centered">
      <h1 class="has-space-bottom ">Repository Recommendations</h1>
      <h3 class="">Find the Best Repository for Your Research Products</h3>
    </div>

    <v-container>
      <div id="options-grid" class="">
        <v-card class="  " >
          <v-card-text class="has-text-centered">
            <v-icon>mdi-plus-circle-outline</v-icon>
            <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">I have geospatial data</h3>
            <p class="has-text-mute has-text-centered">Learn more about formats, best practices, and repositories for geospatial data.</p>
          </v-card-text>
        </v-card>

        <v-card class="  " >
          <v-card-text class="has-text-centered">
            <v-icon>mdi-plus-circle-outline</v-icon>
            <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">My data are derived from

  physical samples</h3>
            <p class="has-text-mute has-text-centered">Learn more about registering physical samples and submitting data derived from samples.</p>
          </v-card-text>
        </v-card>

        <v-card class="  " >
          <v-card-text class="has-text-centered">
            <v-icon>mdi-plus-circle-outline</v-icon>
            <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">I want to submit multiple

  types of data together</h3>
            <p class="has-text-mute has-text-centered">Learn more about best practices for assembling multiple datasets for a project or publication. </p>
          </v-card-text>
        </v-card>
      </div>
    </v-container>

    <v-divider />

    <section class="has-text-centered">
      <h1 class="has-space-bottom-2x ">Not Sure? Let us Help You Decide</h1>
      <p class="has-text-mute has-space-bottom-2x">Click the button below to begin an interactive questionnaire that will help us identify which data formats, best practices, and repository is right for your data. </p>
      <v-btn class=" ">Repository Recommendations</v-btn>
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

  #options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
    gap: 2rem;
  }

  .banner {
    padding: 6rem 4rem;
    background: #cfd8dc3b;
    margin-bottom: 0;
  }
</style>
