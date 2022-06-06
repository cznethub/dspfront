<template>
  <v-container class="cz-about d-flex full-height pa-0">
    <div id="panel-left" class="flex-grow-1 hidden-sm-and-down"
      :style="{ 'background-image': 'linear-gradient(rgb(0 52 82 / 31%), rgba(0, 0, 0, 0)), url(' + require('@/assets/img/bg-4.png') + ')' }">
    </div>
    <v-container id="panel-right" class="pa-8">
      <div class="text-h4">About HydroShare</div>
      <v-divider class="has-space-bottom" />
      <p class="text-body-1">
        HydroShare is the Consortium of Universities for the Advancement of Hydrologic Science, Inc. (CUAHSI)'s web based hydrologic information system for users to share and publish data and models in a variety of flexible formats, and to make this information available in a citable, shareable and discoverable manner. It enables users to collaborate and work as teams in a web based collaborative environment, thereby enhancing research, education and application of hydrologic knowledge. Hydroshare includes tools (web apps) that can act on content in HydroShare providing users with a gateway to computing and analysis. HydroShare is being developed by a CUAHSI team supported by National Science Foundation awards ACI-1148453, ACI-1148090, EAR-1338606, OAC-1664018, OAC-1664061, OAC-1664119.
      </p>
      <p class="text-body-1">
        CUAHSI is an organization representing more than 130 U.S. universities and international water-science-related organizations and is sponsored by the National Science Foundation to provide infrastructure and services to advance the development of hydrologic science and education in the United States.
      </p>
    </v-container>
    
  </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-about',
    components: { },
  })
  export default class CzAbout extends Vue {

  }
</script>

<style lang="scss" scoped>
  #panel-left {
    background-size: cover;
    flex: 3;
  }

  #panel-left {
    padding-top: 8rem;
    background-size: cover;
  }

  #panel-right {
    flex: 1;
    flex-direction: column;
  }
</style>
