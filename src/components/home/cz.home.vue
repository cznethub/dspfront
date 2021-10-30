<template>
  <div class="cz-home">
    <section class="banner has-text-centered has-text-shadow"
      :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.7), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-2.png') + ')' }">
      <h1 class="md-display-2 has-text-white">Critical Zone Collaborative Network</h1>
      <h2 class="md-display-1 has-text-white has-space-top-2x">Data Submission Portal</h2>
      <template v-if="!isLoggedIn">
        <h2 class="md-headline has-text-white has-space-top-2x">Ready to Submit Data?</h2>
        <router-link to="login">
          <md-button class="md-raised">Log In</md-button>
        </router-link>
      </template>
    </section>

    <section class="md-layout md-alignment-center-center">
      <div class="md-layout-item">
        <div class="md-layout md-alignment-center-center" style="flex-direction: column;">
          <h1 class="md-display-1 has-space-bottom">Submit Your Research Products</h1>
          <p class="has-text-mute has-text-centered">Created for the Critical Zone Collaborative Network (CZCN), this Data Submission Portal provides tools for determining which repository to use for data submission along with enhanced submission tools to encourage data standards, complete metadata, and high-quality submissions.</p>
        </div>

        <div id="features-1" class="md-layout has-space-top-2x md-alignment-top-center">
          <div class="md-layout-item md-layout md-gutter">
            <md-icon class="md-size-2x md-layout-item">check_circle_outline</md-icon>
            <div class="md-layout-item">
              <h3 class="md-headline">Which repository?</h3>
              <p class="has-text-mute">Use the Portal's repository recommendation system to determine which repository is right for submitting your research products.</p>
            </div>
          </div>

          <div class="md-layout-item md-layout md-gutter">
            <md-icon class="md-size-2x md-layout-item">check_circle_outline</md-icon>
            <div class="md-layout-item">
              <h3 class="md-headline">Which format?</h3>
              <p class="has-text-mute">Use CZ community recommendations to decide on formats and conventions for your data files.</p>
            </div>
          </div>

          <div class="md-layout-item md-layout md-gutter">
            <md-icon class="md-size-2x md-layout-item">check_circle_outline</md-icon>
            <div class="md-layout-item">
              <h3 class="md-headline">Which metadata?</h3>
              <p class="has-text-mute">Use the Portal's submission tools to ensure your metadata are complete and that your data are well described.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr>

    <section class="has-text-centered">
      <h1 class="md-display-1 has-space-bottom-2x">What do you want to do?</h1>
      <div id="features-2" class="md-layout md-gutter md-alignment-top-center">
        <div class="md-layout-item">
          <md-icon class="md-size-4x md-layout-item">post_add</md-icon>
          <h3 class="md-headline has-space-bottom has-space-top">Submit Data Products</h3>
          <p class="has-text-mute">Assemble your data files and metadata using our templates and submit directly to a supported repository.</p>
        </div>
        <div class="md-layout-item">
          <md-icon class="md-size-4x md-layout-item">travel_explore</md-icon>
          <h3 class="md-headline has-space-bottom has-space-top">Find the Right Repository</h3>
          <p class="has-text-mute">Don't know which repository to use? Use our repository recommendation system to decide which repository is the best place for your data.</p>
        </div>
        <div class="md-layout-item">
          <md-icon class="md-size-4x md-layout-item">find_in_page</md-icon>
          <h3 class="md-headline has-space-bottom has-space-top">Explore CZCN Data</h3>
          <p class="has-text-mute">All products submitted via this Portal are  cataloged for browsing and discovery via the <a href="https://www.hydroshare.org/" target="_blank">HydroShare repository</a>. </p>
        </div>
      </div>
    </section>

    <hr>

    <section class="md-layout">
      <div class="md-layout-item md-small-size-100">
        <h1 class="md-display-1 has-space-bottom-2x">Make your Data FAIR</h1>
        <p class="has-text-mute">This Data Submission Portal works with reputable Earth Science repositories to ensure that research products you submit are <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and <u>R</u>eusable.</p>
      </div>

      <div class="md-layout-item md-layout md-alignment-center-center md-small-size-100">
        <img :src="require('@/assets/img/fair.png')" alt="">
      </div>
    </section>

    <hr>

    <section>
      <h1 class="md-display-1 has-space-bottom md-layout md-alignment-center-center has-text-centered">Supported Repositories</h1>
      <div class="md-layout md-alignment-center-center">
        <p class="has-text-mute has-text-centered">Data submitted via this Portal are deposited in multiple repositories. Click the links below to learn more about each of the supported repositories.</p>
      </div>
      <div class="md-layout repos md-alignment-center-center md-gutter">
        <div v-for="repo of supportedRepositories" :key="repo.key" class="md-layout-item md-xsmall-size-50">
          <img :src="repo.logoSrc" :alt="repo.name">
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import User from '@/models/user.model'
import { repoMetadata } from '../submit/constants'

  @Component({
    name: 'cz-home',
    components: { },
  })
  export default class CzHome extends Vue {
    protected repoMetadata = repoMetadata

    protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }

    protected get supportedRepositories() {
      return Object.keys(repoMetadata).map(key => repoMetadata[key])
    }

  }
</script>

<style lang="scss" scoped>
  $md-padding: 17px;

  p {
    max-width: 70rem;
  }

  section {
    padding: 4rem;
  }

  .banner {
    background-size: cover;
    background-repeat: no-repeat;
    padding-top: 9rem;
    padding-bottom: 9rem;
    margin: -$md-padding;
    margin-bottom: 4rem;
  }

  #features-1 {
    .md-icon {
      flex: 0;
      margin: 0;
      margin-top: 1rem;
    }

    & > .md-layout-item {
      flex-basis: 38rem;
      flex-grow: 0;
      padding: 2rem;
    }
  }

  #features-2 {
    & > .md-layout-item {
      flex-basis: 40rem;
      flex-grow: 0;
      padding: 2rem;
    }

    .md-layout-item:nth-child(1) .md-icon {
      color: #AFB9C8;
    }
    .md-layout-item:nth-child(2) .md-icon {
      color: #E3CDC1;
    }
    .md-layout-item:nth-child(3) .md-icon {
      color: #A6D6D6;
    }
  }

  .repos {
    & > div {
      max-width: 30rem;
    }
  }
</style>
