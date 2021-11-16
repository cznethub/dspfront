<template>
  <div class="cz-resources">
    <h1 class="md-display-1">Resources</h1>
    <hr>
    <section class="has-text-centered">
      <h2>Repository Recommendations</h2>
      <p class="has-text-mute">If you aren't sure which repository to use, visit our repository recommendation system to get help.</p>
      <router-link to="/recommendations">
        <md-button class="md-raised md-accent">Help Me Decide</md-button>
      </router-link>
    </section>

    <hr>

    <section>
      <div class="has-text-centered">
        <h2 class="has-space-bottom">Best Practices and Data Templates</h2>
        <p class="has-text-mute">Access best practices, recommendations, suggested formats and rep﻿ository recommendations for the data types listed below.</p>
      </div>

      <div class="md-layout md-alignment-top-center has-space-bottom-2x">
        <div id="data-templates" class="md-layout-item md-layout" style="flex-direction: column;">
          <div class="md-layout-item md-layout">
            <!-- <img class="md-layout-item" :src="require('@/assets/img/placeholder.png')" alt="" style="flex: 0;"> -->
            <md-icon class="md-size-4x md-layout-item" style="color: #87AAAA;">layers</md-icon>
            <div class="md-layout-item">
              <h4 class="has-text-weight-bold ">Geospatial Data</h4>
              <p class="has-text-mute">Geospatial data include geographic feature and raster datasets.</p>
            </div>
          </div>

          <div class="md-layout-item md-layout">
            <md-icon class="md-size-4x md-layout-item" style="color: #BCCC9A;">timeline</md-icon>
            <div class="md-layout-item">
              <h4 class="has-text-weight-bold">Sensor Time Series Data</h4>
              <p class="has-text-mute">Sensor datasets typically consist of time series of observations from sensors deployed in the environment.</p>
            </div>
          </div>

          <div class="md-layout-item md-layout">
            <md-icon class="md-size-4x md-layout-item" style="color: #C37B89;">account_tree</md-icon>
            <div class="md-layout-item">
              <h4 class="has-text-weight-bold">Data Derived from Samples</h4>
              <p class="has-text-mute">Access best practices, recommendations, formats, and repository recommendations for geospatial data.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr>
    <section class="has-space-bottom-2x has-space-top-2x has-text-centered">
      <h2 class="mat-display-1">Tools for Automating Submissions</h2>
      <p class="has-text-mute">If you are a developer, you can use the following resources to automate submissions to the repositories supported by the Data Submission Portal.</p>
    </section>
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
    padding: 1rem;
  }

  #data-templates {
    max-width: 65rem;
    margin-top: 4rem;

    & > div.md-layout {
      justify-content: flex-start;
      align-items: center;
      margin: 1.5rem 0;
    }

    img, .md-icon {
      margin-right: 3rem;
      flex: 0;
    }
  }
</style>
