<template>
  <div class="cz-home">
    <section class="banner has-text-centered has-text-shadow"
      :class="isLoggedIn ? '' : ''"
      :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.7), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-2.png') + ')', 'flex-direction': 'column' }">
      <div>
        <h1 class=" has-text-white">Critical Zone Collaborative Network</h1>
        <h2 class=" has-text-white has-space-top-2x">Data Submission Portal</h2>
      </div>
      <template v-if="!isLoggedIn">
        <div>
          <h2 class=" has-text-white has-space-top-2x has-space-bottom">Ready to Submit Data?</h2>
          <router-link to="/login" tag="v-btn">Log In</router-link>
        </div>
      </template>
    </section>

    <section class="">
      <div class="">
        <div class="has-text-centered d-flex flex-column align-center">
          <h1 class="has-space-bottom">Submit Your Research Products</h1>
          <p class="has-text-mute has-text-centered">Created for the Critical Zone Collaborative Network (CZCN), this Data Submission Portal provides tools for determining which repository to use for data submission along with enhanced submission tools to encourage data standards, complete metadata, and high-quality submissions.</p>
        </div>

        <div id="features-1" class="has-space-top-2x d-flex flex-wrap justify-center">
          <div class="d-flex align-start">
            <v-icon class="">mdi-checkbox-marked-circle-outline</v-icon>
            <div class="">
              <h3 class="">Which repository?</h3>
              <p class="has-text-mute">Use the Portal's repository recommendation system to determine which repository is right for submitting your research products.</p>
            </div>
          </div>

          <div class="d-flex align-start">
            <v-icon class="">mdi-checkbox-marked-circle-outline</v-icon>
            <div class="">
              <h3 class="">Which format?</h3>
              <p class="has-text-mute">Use CZ community recommendations to decide on formats and conventions for your data files.</p>
            </div>
          </div>

          <div class="d-flex align-start">
            <v-icon class="">mdi-checkbox-marked-circle-outline</v-icon>
            <div class="">
              <h3 class="">Which metadata?</h3>
              <p class="has-text-mute">Use the Portal's submission tools to ensure your metadata are complete and that your data are well described.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <v-divider/>

    <section class="has-text-centered">
      <h1 class="has-space-bottom-2x">What do you want to do?</h1>
      <div id="features-2" class="d-flex flex-wrap justify-center">
        <div class="">
          <v-icon class=" ">mdi-book-plus</v-icon>
          <h3 class=" has-space-bottom has-space-top">Submit Data Products</h3>
          <div class="has-text-mute">Assemble your data files and metadata using our templates and submit directly to a supported repository.</div>
        </div>
        <div class="">
          <v-icon class=" ">mdi-arrow-decision</v-icon>
          <h3 class=" has-space-bottom has-space-top">Find the Right Repository</h3>
          <div class="has-text-mute">Don't know which repository to use? Use our repository recommendation system to decide which repository is the best place for your data.</div>
        </div>
        <div class="">
          <v-icon class=" ">mdi-database-search</v-icon>
          <h3 class=" has-space-bottom has-space-top">Explore CZCN Data</h3>
          <div class="has-text-mute">All products submitted via this Portal are  cataloged for browsing and discovery via the <a href="https://www.hydroshare.org/" target="_blank">HydroShare repository</a>. </div>
        </div>
      </div>
    </section>

    <v-divider/>

    <section class="d-flex align-center flex-wrap">
      <div>
        <h1 class="has-space-bottom-2x">Make your Data FAIR</h1>
        <p class="has-text-mute">This Data Submission Portal works with reputable Earth Science repositories to ensure that research products you submit are <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and <u>R</u>eusable.</p>
      </div>

      <div class="has-space-top-2x">
        <img :src="require('@/assets/img/fair.png')" alt="">
      </div>
    </section>

    <v-divider/>

    <section>
      <h1 class="has-space-bottom has-text-centered">Supported Repositories</h1>
      <div class="d-flex justify-center has-space-bottom-2x">
        <p class="has-text-mute has-text-centered">Data submitted via this Portal are deposited in multiple repositories. Click the links below to learn more about each of the supported repositories.</p>
      </div>
      <div class="repos has-space-bottom-2x d-flex flex-wrap align-center justify-center">
        <img v-for="repo of supportedRepositories" :key="repo.key" :src="repo.logoSrc" :alt="repo.name">
      </div>
    </section>
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

    protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }

    protected get supportedRepositories() {
      return Object.keys(repoMetadata).map(key => repoMetadata[key])
    }

  }
</script>

<style lang="scss" scoped>

  p {
    max-width: 70rem;
  }

  .banner {
    background-size: cover;
    background-repeat: no-repeat;
    padding-top: 9rem;
    padding-bottom: 9rem;
    margin-bottom: 2rem;
  }

  section {
    padding: 4rem;
  }

  #features-1 {
    .v-icon {
      flex: 0;
      margin: 0;
      margin-top: 1rem;
    }

    & > div {
      flex-basis: 38rem;
      flex-grow: 0;
      padding: 2rem;
    }
  }

  #features-2 {
    & > div {
      flex-basis: 40rem;
      flex-grow: 0;
      padding: 2rem;
    }

    // .:nth-child(1) .v-icon {
    //   color: #AFB9C8;
    // }
    // .:nth-child(2) .v-icon {
    //   color: #E3CDC1;
    // }
    // .:nth-child(3) .v-icon {
    //   color: #A6D6D6;
    // }
  }

  .repos {
    // display: flex;
    gap: 2rem 4rem;
    // flex-wrap: wrap;
    // align-items: center;
    // justify-content: center;

    img {
      height: 5rem;
    }
  }
</style>
