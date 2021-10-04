<template>
  <div class="cz-resources">
    <h1>Resources</h1>
    <hr>

    <div id="banner" class="is-flex is-flex-direction-column is-align-items-center">
      <h2>Repository Recommendations</h2>
      <p class="has-text-mute">If you aren't sure which repository to use, visit our repository recommendation system to get help.</p>
      <button class="button is-size-3" @click="goToRecommendations">Help Me Decide</button>
    </div>
    <hr>

    <div class="is-flex is-flex-direction-column is-align-items-center">
      <h2 class="has-space-bottom">Best Practices and Data Templates</h2>
      <p class="has-text-mute">Access best practices, recommendations, suggested formats and rep﻿ository recommendations for the data types listed below.</p>
    </div>

    <div class="is-flex is-justify-content-center has-space-bottom-2x">
      <div id="data-templates" class="is-flex is-flex-direction-column">
        <div class="level">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold">Geospatial Data</h4>
            <p class="has-text-mute">Geospatial data include geographic feature and raster datasets.</p>
          </div>
        </div>

        <div class="level">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold">Sensor Time Series Data</h4>
            <p class="has-text-mute">Sensor datasets typically consist of time series of observations from sensors deployed in the environment.</p>
          </div>
        </div>

        <div class="level">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold">Data Derived from Samples</h4>
            <p class="has-text-mute">Access best practices, recommendations, formats, and repository recommendations for geospatial data.</p>
          </div>
        </div>
      </div>
    </div>
    <hr>
    <div class="is-flex is-flex-direction-column is-align-items-center has-space-bottom-2x has-space-top-2x">
      <h2>Tools for Automating Submissions</h2>
      <p class="has-text-mute">If you are a developer, you can use the following resources to automate submissions to the repositories supported by the Data Submission Portal.</p>
    </div>
    
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-resources',
    components: { },
  })
  export default class CzResources extends Vue {
    protected goToRecommendations() {
      this.$router.push({ path: '/recommendations' })
    }
  }
</script>

<style lang="scss" scoped>
  .cz-resources {
    padding: 2rem 4rem;
  }

  #data-templates {
    max-width: 65rem;
    margin-top: 4rem;

    & > div.level {
      justify-content: flex-start;
      margin-bottom: 3rem;
    }

    h4 {
      margin-bottom: 1.5rem;
    }

    img {
      margin-right: 3rem;
      height: 12rem;
    }
  }

  #banner {
    padding: 4rem 2rem;

    h1, p {
      margin-bottom: 2rem;
    }
  }
</style>
