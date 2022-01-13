<template>
  <div class="cz-resources">
    <div class="has-bg-light-gray has-space-bottom-2x banner d-flex flex-column align-center">
      <div class="text-h4 has-space-bottom">Repository Recommendations</div>
      <p class="text-body-1 has-space-bottom">If you aren't sure which repository to use, visit our repository recommendation system to get help.</p>
      <v-btn color="primary" to="/resources/recommendations">Help Me Decide</v-btn>
    </div>

    <v-container>
      <div class="d-flex flex-column align-center">
        <div class="has-space-bottom text-h4">Best Practices and Data Templates</div>
        <p class="text--secondary text-subtitle-1">Access best practices, recommendations, suggested formats and rep﻿ository recommendations for the data types listed below.</p>
      </div>

      <div class="has-space-bottom-2x d-flex justify-center">
        <div id="data-templates" class="d-inline-flex flex-column">
          <div class="d-flex align-center">
            <v-icon  style="color: #87AAAA;">mdi-layers</v-icon>
            <div>
              <div class="text-h6">Geospatial Data</div>
              <p class="text--secondary text-subtitle-1">Geospatial data include geographic feature and raster datasets.</p>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-icon  style="color: #BCCC9A;">mdi-chart-timeline-variant</v-icon>
            <div>
              <div class="text-h6">Sensor Time Series Data</div>
              <p class="text--secondary text-subtitle-1">Sensor datasets typically consist of time series of observations from sensors deployed in the environment.</p>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-icon  style="color: #C37B89;">mdi-file-tree</v-icon>
            <div>
              <div class="text-h6">Data Derived from Samples</div>
              <p class="text--secondary text-subtitle-1">Access best practices, recommendations, formats, and repository recommendations for geospatial data.</p>
            </div>
          </div>
        </div>
      </div>
    </v-container>

    <v-divider />
    <v-container class="has-space-bottom-2x has-space-top-2x d-flex flex-column align-center">
      <div class="text-h4 mb-4">Tools for Automating Submissions</div>
      <p class="text--secondary text-subtitle-1 has-space-bottom-2x">If you are a developer, you can use the following resources to automate submissions to the repositories supported by the Data Submission Portal.</p>
    </v-container>
  </div>
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
