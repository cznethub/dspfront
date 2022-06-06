<template>
  <div class="cz-home">
    <v-carousel v-model="model" height="100%">
      <v-carousel-item
        v-for="(slide, i) in slides"
        :key="i"
      >
        <v-sheet
          :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.4), rgba(28, 37, 65, 0.16)), url(' + slide.image + ')', 'flex-direction': 'column' }"
          height="100%"
          class="slide-container"
          tile
        >
          <v-row
            class="fill-height pa-0 ma-0"
            align="center"
            justify="center"
          >
            <div class="pa-10 slide-text has-text-shadow text-center has-text-white">
              <div class="text-h4 mb-8">
                <p>{{ slide.heading }}</p>
              </div>
              <div class="text-h6 text-center">
                <p>{{ slide.subHeading }}</p>
              </div>

              <template v-if="!isLoggedIn">
                <div>
                  <div class="has-text-white has-space-top-2x has-space-bottom has-text-shadow text-h6">Ready to Submit Data?</div>
                  <v-btn @click="openLogInDialog()" rounded>Log In</v-btn>
                </div>
              </template>
            </div>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { repoMetadata } from '../submit/constants'
  import User from '@/models/user.model'

  @Component({
    name: 'cz-home',
    components: { },
  })
  export default class CzHome extends Vue {
    protected repoMetadata = repoMetadata
    protected model = 0
    protected slides = [
      { 
        heading: 'Discover', 
        subHeading: 'Discover content shared by your colleagues and other researchers. Access a broad range of data types used in hydrology.', 
        image: require('@/assets/img/discover.jpg') 
      },
      { 
        heading: 'Collaborate', 
        subHeading: 'Upload and share a broad set of hydrologic data types including time series, GIS, and models. You manage who can access the content you share.', 
        image: require('@/assets/img/collaborate.jpg') 
      },
      { 
        heading: 'Fulfill your Data Management Plan and Formally Publish your Data', 
        subHeading: 'Give your funders confidence that your data will be available in perpetuity and obtain Digital Object Identifiers so your content can be cited.', 
        image: require('@/assets/img/fulfill.jpg') 
      },
    ]

    protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }

    protected get supportedRepositories() {
      return Object.keys(repoMetadata)
        .map(key => repoMetadata[key])
        .filter(repo => !repo.isExternal && repo.isSupported)
    }

    protected openLogInDialog() {
      User.openLogInDialog()
    }
  }
</script>

<style lang="scss" scoped>
  .cz-home {
    height: 100%;
  }

  .slide-container {
    background-size: cover;
  }

  p {
    max-width: 70rem;
  }
</style>
