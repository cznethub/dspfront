<template>
  <div class="cz-home">
    <section class="banner has-text-centered content-row"
      :style="{ 'background-image': 'url(' + require('@/assets/img/placeholder.png') + ')' }">
      <div class="content-wrapper">
        <h1>Critical Zone Collaborative Network</h1>
        <h2 class="has-text-mute">Data Submission Portal</h2>
        <h2 class="has-text-mute" style="margin-top: 4rem;">Ready to Submit Data?</h2>
        <button class="button is-size-3">Log In</button>
      </div>
    </section>

    <section class="has-text-centered content-row">
      <div class="content-wrapper">
        <div class="is-flex is-flex-direction-column is-align-items-center">
          <h1>Submit Your Research Products</h1>
          <p class="has-text-mute">Created for the Critical Zone Collaborative Network (CZCN), this Data Submission Portal provides tools for determining which repository to use for data submission along with enhanced submission tools to encourage data standards, complete metadata, and high-quality submissions.</p>
        </div>

        <ul class="features is-flex-desktop is-align-items-flex-start">
          <li class="level has-text-left is-align-items-flex-start">
            <i class="far fa-check-circle level-item" />
            <div>
              <h3>Which repository?</h3>
              <p class="has-text-mute">Use the Portal's repository recommendation system to determine which repository is right for submitting your research products.</p>
            </div>
          </li>

          <li class="level has-text-left is-align-items-flex-start">
            <i class="far fa-check-circle" />
            <div>
              <h3>Which format?</h3>
              <p class="has-text-mute">Use CZ community recommendations to decide on formats and conventions for your data files.</p>
            </div>
          </li>

          <li class="level has-text-left is-align-items-flex-start">
            <i class="far fa-check-circle" />
            <div>
              <h3>Which metadata?</h3>
              <p class="has-text-mute">Use the Portal's submission tools to ensure your metadata are complete and that your data are well described.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <hr>

    <section class="has-text-centered content-row">
      <div class="content-wrapper">
        <h1>What do you want to do?</h1>
        <ul class="features is-flex">
          <li class="is-flex-direction-column">
            <img :src="require('@/assets/img/placeholder.png')" alt="">
            <h3>Submit Data Products</h3>
            <p class="has-text-mute">Assemble your data files and metadata using our templates and submit directly to a supported repository.</p>
          </li>
          <li class="is-flex-direction-column">
            <img :src="require('@/assets/img/placeholder.png')" alt="">
            <h3>Find the Right Repository</h3>
            <p class="has-text-mute">Don't know which repository to use? Use our repository recommendation system to decide which repository is the best place for your data.</p>
          </li>
          <li class="is-flex-direction-column">
            <img :src="require('@/assets/img/placeholder.png')" alt="">
            <h3>Explore CZCN Data</h3>
            <p class="has-text-mute">All products submitted via this Portal are  cataloged for browsing and discovery via the <a href="https://www.hydroshare.org/" target="_blank">HydroShare repository</a>. </p>
          </li>
        </ul>
      </div>
    </section>

    <hr>

    <section class="content-row">
      <div class="content-wrapper is-flex">
        <div class="is-flex-grow-1">
          <h1>Make your Data FAIR</h1>
          <p class="has-text-mute">This Data Submission Portal works with reputable Earth Science repositories to ensure that research products you submit are <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and <u>R</u>eusable.</p>
        </div>

        <div class="is-flex-grow-1">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
        </div>
      </div>
    </section>

    <hr>

    <section class="has-text-centered content-row">
      <div class="content-wrapper">
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

  @Component({
    name: 'cz-home',
    components: { },
  })
  export default class CzHome extends Vue {

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
    background-size: contain;
    padding-top: 6rem;
    padding-bottom: 6rem;

    h1 {
      margin-bottom: 2rem;
    }

    button {
      margin-top: 2rem;
    }
  }

  .features {
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-evenly;

    h3 {
      line-height: 2;
      margin-bottom: 1rem;
    }

    & > li {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      max-width: 40rem;
      padding: 2rem;

      i {
        margin: 0;
        font-size: 5rem;
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
