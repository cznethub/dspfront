<template>
  <div class="cz-resources">
    <v-container class="has-bg-light-gray text-center mb-2 banner d-flex flex-column align-center py-8">
      <div class="text-h4 mb-2">Repository Recommendations</div>
      <p class="text-body-1 mb-4">If you aren't sure which repository to use, visit our repository recommendation system to get help.</p>
      <v-btn color="primary" to="/resources/recommendations">Help Me Decide</v-btn>
    </v-container>

    <v-container>
      <div class="d-flex flex-column align-center pt-8">
        <div class="mb-2 text-h4">Best Practices and Data Templates</div>
        <p class="text--secondary text-subtitle-1 text-center">Access best practices, recommendations, suggested formats and rep﻿ository recommendations for the data types listed below.</p>
        <p class="text--secondary text-subtitle-1 text-center">Coming soon: In this section, we will be posting recommendations for best practices and data templates you should consider using for your data submissions.</p>
      </div>

      <div class="mb-2 d-flex justify-center">
        <div id="data-templates" class="d-inline-flex flex-column">
          <div v-for="(tmp, index) of dataTemplates" :key="index"
            class="d-flex align-center flex-md-row flex-column my-4 my-md-0">
            <div class="d-flex justify-center align-center flex-shrink-0" style="width: 256px; height: 128px;">
              <v-icon :class="tmp.iconClass" :style="{ 'color': tmp.iconColor }">{{ tmp.icon }}</v-icon>
            </div>
            <div class="text-center text-md-left">
              <div class="text-h6">{{ tmp.title }}</div>
              <p class="text--secondary text-subtitle-1">{{ tmp.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </v-container>

    <v-divider />

    <v-container class="my-4 d-flex flex-column align-center py-8 text-center">
      <div class="text-h4 mb-4">Tools for Automating Submissions</div>
      <p class="text--secondary text-subtitle-1">If you are a developer, you can explore using available application programming interfaces (APIs) for automating submissions. Documentation for the following APIs is available.</p>
      <ul class="text-left">
        <li class="text--secondary text-subtitle-1">HydroShare API: <a href="https://help.hydroshare.org/introduction-to-hydroshare/getting-started/use-the-api/" target="_blank">https://help.hydroshare.org/introduction-to-hydroshare/getting-started/use-the-api/</a></li>
        <li class="text--secondary text-subtitle-1">Zenodo API: <a href="https://developers.zenodo.org/" target="_blank">https://developers.zenodo.org/</a></li>
        <li class="text--secondary text-subtitle-1">EarthChem API: Coming soon...</li>
      </ul>
    </v-container>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  interface IDataTemplate {
    title: string
    description: string
    icon: string
    iconColor: string
    iconClass?: string
  }

  const dataTemplates: IDataTemplate[]  = [
    {
      title: 'Sensor Time Series Data',
      description: 'Learn more about formats, best practices, and repositories for sensor time series data data.',
      icon: 'mdi-chart-timeline-variant',
      iconColor: '#BCCC9A',
    },
    {
      title: 'Geospatial Data',
      description: 'Geospatial data include geographic feature and raster datasets.',
      icon: 'mdi-layers',
      iconColor: '#87AAAA',
    },
    {
      title: 'Data Derived from Samples',
      description: 'Learn more about registering physical samples and submitting data derived from samples.',
      icon: 'mdi-file-tree',
      iconColor: '#C37B89',
    },
    {
      title: 'Sharing Multiple Data Types Together',
      description: 'Learn more about best practices for assembling multiple datasets for a project or publication.',
      icon: 'mdi-chart-multiple',
      iconColor: '#5784BA',
      iconClass: 'is-smaller',
    }
  ]

  @Component({
    name: 'cz-resources',
    components: { },
  })
  export default class CzResources extends Vue {
    protected dataTemplates!: IDataTemplate[] 

    beforeCreate() {
      this.dataTemplates = dataTemplates
    }
  }
</script>

<style lang="scss" scoped>
  .cz-resources {
    // padding: 1rem;
  }

  #data-templates {
    max-width: 65rem;

    img, .v-icon {
      flex: 0;
      font-size: 8rem;
    }

    .v-icon.is-smaller {
      flex: 0;
      font-size: 6rem;
    }
  }
</style>
