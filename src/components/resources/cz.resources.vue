<template>
  <v-container class="cz-resources">
    <h1 class="">Resources</h1>
    <v-divider />
    <v-container class="has-text-centered">
      <h2>Repository Recommendations</h2>
      <p class="has-text-mute">If you aren't sure which repository to use, visit our repository recommendation system to get help.</p>
      <router-link to="/recommendations" tag="v-btn">
        Help Me Decide
      </router-link>
    </v-container>

    <v-divider />

    <v-container>
      <div class="has-text-centered">
        <h2 class="has-space-bottom">Best Practices and Data Templates</h2>
        <p class="has-text-mute">Access best practices, recommendations, suggested formats and rep﻿ository recommendations for the data types listed below.</p>
      </div>

      <div class="has-space-bottom-2x d-flex justify-center">
        <div id="data-templates" class="d-inline-flex flex-column">
          <div class="d-flex align-center">
            <!-- <img class="" :src="require('@/assets/img/placeholder.png')" alt="" style="flex: 0;"> -->
            <v-icon class=" " style="color: #87AAAA;">mdi-layers</v-icon>
            <div class="">
              <h4 class="">Geospatial Data</h4>
              <p class="has-text-mute">Geospatial data include geographic feature and raster datasets.</p>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-icon class=" " style="color: #BCCC9A;">mdi-chart-timeline-variant</v-icon>
            <div class="">
              <h4 class="">Sensor Time Series Data</h4>
              <p class="has-text-mute">Sensor datasets typically consist of time series of observations from sensors deployed in the environment.</p>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-icon class=" " style="color: #C37B89;">mdi-file-tree</v-icon>
            <div class="">
              <h4 class="">Data Derived from Samples</h4>
              <p class="has-text-mute">Access best practices, recommendations, formats, and repository recommendations for geospatial data.</p>
            </div>
          </div>
        </div>
      </div>
    </v-container>

    <v-divider />
    <v-container class="has-space-bottom-2x has-space-top-2x has-text-centered">
      <h2 class="">Tools for Automating Submissions</h2>
      <p class="has-text-mute">If you are a developer, you can use the following resources to automate submissions to the repositories supported by the Data Submission Portal.</p>
    </v-container>
  </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-resources',
    components: { },
  })
  export default class CzResources extends Vue {

  }
</script>

<style lang="scss" scoped>
  .cz-resources {
    // padding: 1rem;
  }

  #data-templates {
    max-width: 65rem;
    margin-top: 4rem;

    img, .v-icon {
      margin-right: 3rem;
      flex: 0;
      font-size: 8rem;
    }
  }
</style>
