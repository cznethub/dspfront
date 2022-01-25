<template>
  <div class="cz-home">
    <div class="banner text-center"
      :class="isLoggedIn ? '' : ''"
      :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.7), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-2.png') + ')', 'flex-direction': 'column' }">
      <div class="has-text-shadow">
        <div class="has-text-white text-h3">Critical Zone Collaborative Network</div>
        <div class="has-text-white has-space-top-2x text-h4">Data Submission Portal</div>
      </div>
      <template v-if="!isLoggedIn">
        <div>
          <div class="has-text-white has-space-top-2x has-space-bottom has-text-shadow text-h6">Ready to Submit Data?</div>
          <v-btn to="/login" rounded>Log In</v-btn>
        </div>
      </template>
    </div>

    <section>
      <div>
        <div class="text-center d-flex flex-column align-center">
          <div class="has-space-bottom text-h4">Submit Your Research Products</div>
          <p class="text--secondary text-center text-subtitle-1">Created for the Critical Zone Collaborative Network (CZCN), this Data Submission Portal provides tools for determining which repository to use for data submission along with enhanced submission tools to encourage data standards, complete metadata, and high-quality submissions.</p>
        </div>

        <v-row id="features-1" justify="center" align="baseline" class="has-space-top-2x">
          <v-col class="d-flex align-start">
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div>
              <div class="text-h6">Which repository?</div>
              <p class="text--secondary text-subtitle-1">Use the Portal's repository recommendation system to determine which repository is right for submitting your research products.</p>
            </div>
          </v-col>

          <v-col class="d-flex align-start">
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div>
              <div class="text-h6">Which format?</div>
              <p class="text--secondary text-subtitle-1">Use CZ community recommendations to decide on formats and conventions for your data files.</p>
            </div>
          </v-col>

          <v-col class="d-flex align-start">
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div>
              <div class="text-h6">Which metadata?</div>
              <p class="text--secondary text-subtitle-1">Use the Portal's submission tools to ensure your metadata are complete and that your data are well described.</p>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <v-divider/>

    <section class="text-center">
      <div class="has-space-bottom-2x text-h4">What do you want to do?</div>
      <v-row id="features-2" justify="center">
        <v-col>
          <v-icon>mdi-book-plus</v-icon>
          <div class="has-space-bottom text-h6">Submit Data Products</div>
          <div class="text--secondary text-subtitle-1">Assemble your data files and metadata using our templates and submit directly to a supported repository.</div>
        </v-col>
        <v-col>
          <v-icon >mdi-arrow-decision</v-icon>
          <div class="has-space-bottom text-h6">Find the Right Repository</div>
          <div class="text--secondary text-subtitle-1">Don't know which repository to use? Use our repository recommendation system to decide which repository is the best place for your data.</div>
        </v-col>
        <v-col>
          <v-icon >mdi-database-search</v-icon>
          <div class=" has-space-bottom text-h6">Explore CZCN Data</div>
          <div class="text--secondary text-subtitle-1">All products submitted via this Portal are  cataloged for browsing and discovery via the <a href="https://www.hydroshare.org/" target="_blank">HydroShare repository</a>. </div>
        </v-col>
      </v-row>
    </section>

    <v-divider/>

    <section class="d-flex align-center flex-wrap">
      <div>
        <div class="has-space-bottom-2x text-h4">Make your Data FAIR</div>
        <p class="text--secondary text-subtitle-1">This Data Submission Portal works with reputable Earth Science repositories to ensure that research products you submit are <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and <u>R</u>eusable.</p>
      </div>

      <div class="has-space-top-2x">
        <img :src="require('@/assets/img/fair.png')" alt="">
      </div>
    </section>

    <v-divider/>

    <section>
      <div class="has-space-bottom text-center text-h4">Supported Repositories</div>
      <div class="d-flex justify-center has-space-bottom-2x">
        <p class="text--secondary text-center text-subtitle-1">Data submitted via this Portal are deposited in multiple repositories. Click the links below to learn more about each of the supported repositories.</p>
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

  section {
    padding: 4rem;
  }

  .banner {
    background-size: cover;
    background-repeat: no-repeat;
    margin-bottom: 2rem;
  }

  #features-1 {
    .v-icon {
      flex: 0;
      margin: 0;
      font-size: 5rem;
      margin-right: 1rem;
    }

    & > div {
      flex-basis: 30rem;
      flex-grow: 0;
      padding: 2rem;
    }
  }

  #features-2 {
    & > div {
      flex-basis: 30rem;
      flex-grow: 0;
      padding: 1rem;
    }

    .v-icon {
      font-size: 5rem;
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
