<template>
  <div class="cz-home">
    <section class="banner has-text-centered is-flex is-justify-content-center section"
      :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.7), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-2.png') + ')' }">
      <div class="container">
        <h1 class="md-display-2 has-text-white">Critical Zone Collaborative Network</h1>
        <h2 class="md-display-1 has-text-white">Data Submission Portal</h2>
        <h2 class="md-headline has-text-white" style="margin-top: 4rem;">Ready to Submit Data?</h2>
        <router-link to="login" v-if="!isLoggedIn">
          <md-button class="md-raised">Log In</md-button>
        </router-link>
      </div>
    </section>

    <section class="is-flex is-justify-content-center section">
      <div class="container">
        <div class="is-flex is-flex-direction-column is-align-items-center has-text-centered">
          <h1 class="md-display-1 has-space-bottom">Submit Your Research Products</h1>
          <p class="has-text-mute">Created for the Critical Zone Collaborative Network (CZCN), this Data Submission Portal provides tools for determining which repository to use for data submission along with enhanced submission tools to encourage data standards, complete metadata, and high-quality submissions.</p>
        </div>

        <div class="md-layout has-space-top-2x">
          <div class="md-layout-item md-layout">
            <md-icon class="md-size-2x md-accent md-layout-item" style="flex: 0;">check_circle_outline</md-icon>
            <div class="md-layout-item">
              <h3 class="md-headline">Which repository?</h3>
              <p class="has-text-mute">Use the Portal's repository recommendation system to determine which repository is right for submitting your research products.</p>
            </div>
          </div>

          <div class="md-layout-item">
            <md-icon class="md-size-2x">check_circle_outline</md-icon>
            <div>
              <h3 class="md-headline">Which format?</h3>
              <p class="has-text-mute">Use CZ community recommendations to decide on formats and conventions for your data files.</p>
            </div>
          </div>

          <div class="md-layout-item">
            <md-icon class="md-size-2x">check_circle_outline</md-icon>
            <div>
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
      <div class="md-layout md-gutter">
        <div class="md-layout-item" style="flex-basis: 34rem;">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <h3>Submit Data Products</h3>
          <p class="has-text-mute">Assemble your data files and metadata using our templates and submit directly to a supported repository.</p>
        </div>
        <div class="md-layout-item" style="flex-basis: 34rem;">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <h3>Find the Right Repository</h3>
          <p class="has-text-mute">Don't know which repository to use? Use our repository recommendation system to decide which repository is the best place for your data.</p>
        </div>
        <div class="md-layout-item" style="flex-basis: 34rem;">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <h3>Explore CZCN Data</h3>
          <p class="has-text-mute">All products submitted via this Portal are  cataloged for browsing and discovery via the <a href="https://www.hydroshare.org/" target="_blank">HydroShare repository</a>. </p>
        </div>
      </div>
    </section>

    <hr>

    <section class="section">
      <div class="container is-flex is-justify-content-center ">
        <div class="is-flex-grow-1">
          <h1>Make your Data FAIR</h1>
          <p class="has-text-mute">This Data Submission Portal works with reputable Earth Science repositories to ensure that research products you submit are <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and <u>R</u>eusable.</p>
        </div>

        <div class="is-flex-grow-1">
          <img :src="require('@/assets/img/placeholder.png')" alt="" style="width: 50rem;">
        </div>
      </div>
    </section>

    <hr>

    <section class="has-text-centered is-flex is-justify-content-center section">
      <div class="container">
        <div class="is-flex is-flex-direction-column is-align-items-center">
          <h1>Supported Repositories</h1>
          <p class="has-text-mute">Data submitted via this Portal are deposited in multiple repositories. Click the links below to learn more about each of the supported repositories.</p>
        </div>
        <div class="level repos">
          <div><img :src="require('@/assets/img/placeholder.png')" alt=""></div>
          <div><img :src="require('@/assets/img/placeholder.png')" alt=""></div>
          <div><img :src="require('@/assets/img/placeholder.png')" alt=""></div>
          <div><img :src="require('@/assets/img/placeholder.png')" alt=""></div>
          <div><img :src="require('@/assets/img/placeholder.png')" alt=""></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import User from '@/models/user.model'

  @Component({
    name: 'cz-home',
    components: { },
  })
  export default class CzHome extends Vue {
    protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }
  }
</script>

<style lang="scss" scoped>
  section {
    padding: 4rem;
  }

  p {
    max-width: 70rem;
  }

  .banner {
    background-size: cover;
    background-repeat: no-repeat;
    padding-top: 6rem;
    padding-bottom: 6rem;
    margin: -17px -17px 0 -17px;

    h1 {
      margin-bottom: 2rem;
    }

    button {
      margin-top: 2rem;
    }
  }

  .features {
    display: flex;
    align-items: flex-start;
    justify-content: space-evenly;
    flex-wrap: wrap;

    h3 {
      line-height: 2;
      margin-bottom: 1rem;
    }

    & > div {
      display: flex;
      flex: 1 1 auto;
      align-items: flex-start;
      max-width: 34rem;
      padding: 2rem;

      .md-icon {
        margin-top: 1rem;
        margin-right: 2rem;
      }
    }
  }

  .repos {
    img {
      padding: 2rem;
    }
  }
</style>
