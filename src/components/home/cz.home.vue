<template>
  <div class="cz-home">
    <v-parallax class="text-center" :src="require('@/assets/img/bg-3.jpg')" :height="isLoggedIn ? 450 : 650">
      <v-container
        class="d-flex flex-column justify-center align-center full-height pa-12"
        style="background-image: linear-gradient(rgb(66 142 218 / 52%), rgb(0 0 0 / 38%));"
      >
        <div class="has-text-shadow">
          <div class="has-text-white text-h3">
            Critical Zone Collaborative Network
          </div>
          <div class="has-text-white has-space-top-2x text-h4">
            Data Submission Portal
          </div>
        </div>
        <template v-if="!isLoggedIn">
          <div>
            <div
              class="has-text-white has-space-top-2x mb-4 has-text-shadow text-h6"
            >
              Ready to Submit Data?
            </div>
            <v-btn @click="openLogInDialog()" rounded>Log In</v-btn>
          </div>
        </template>
        <div class="mt-16">
          <div class="has-text-shadow has-text-white text-h6 mb-2">
            Looking for CZNet data?
          </div>
          <v-btn color="white" outlined :href="discoverySiteUrl">
            Visit our data discovery portal
          </v-btn>
        </div>
      </v-container>
    </v-parallax>

    <section>
      <div>
        <div class="text-center d-flex flex-column align-center">
          <div class="mb-4 text-h4">Submit Your Data and Research Products</div>
          <p class="text--secondary text-center text-subtitle-1">
            Created for the Critical Zone Collaborative Network (CZCN), this
            Data Submission Portal provides tools for determining which
            repository to use for data submission along with enhanced submission
            tools to encourage data standards, complete metadata, and
            high-quality submissions.
          </p>
        </div>

        <v-row
          id="features-1"
          justify="center"
          align="baseline"
          class="has-space-top-2x"
        >
          <v-col
            class="d-flex align-center align-md-start flex-md-row flex-column"
          >
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div class="text-md-left text-center">
              <div class="text-h6">Which repository?</div>
              <p class="text--secondary text-subtitle-1">
                Use the Portal's repository recommendation system to determine
                which repository is right for submitting your research products.
              </p>
            </div>
          </v-col>

          <v-col
            class="d-flex align-center align-md-start flex-md-row flex-column"
          >
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div class="text-md-left text-center">
              <div class="text-h6">Which format?</div>
              <p class="text--secondary text-subtitle-1">
                Use CZ community recommendations to decide on formats and
                conventions for your data files.
              </p>
            </div>
          </v-col>

          <v-col
            class="d-flex align-center align-md-start flex-md-row flex-column"
          >
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div class="text-md-left text-center">
              <div class="text-h6">Which metadata?</div>
              <p class="text--secondary text-subtitle-1">
                Use the Portal's submission tools to ensure your metadata are
                complete and that your data are well described.
              </p>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <v-divider />

    <section class="text-center">
      <div class="has-space-bottom-2x text-h4">What do you want to do?</div>
      <v-row id="features-2" justify="center">
        <v-col>
          <router-link class="is-clickable" to="/submit" tag="div"
            ><v-icon>mdi-book-plus</v-icon></router-link
          >
          <router-link
            class="has-space-bottom text-h6 is-clickable"
            to="/submit"
            tag="div"
            >Submit Data Products</router-link
          >
          <div class="text--secondary text-subtitle-1">
            Assemble your data files and metadata using our templates and submit
            directly to a supported repository.
          </div>
        </v-col>
        <v-col>
          <router-link
            to="/resources/recommendations"
            class="is-clickable"
            tag="div"
            ><v-icon>mdi-arrow-decision</v-icon></router-link
          >
          <router-link
            to="/resources/recommendations"
            class="has-space-bottom text-h6 is-clickable"
            tag="div"
            >Find the Right Repository</router-link
          >
          <div class="text--secondary text-subtitle-1">
            Don't know which repository to use? Use our repository
            recommendation system to decide which repository is the best place
            for your data.
          </div>
        </v-col>
        <!-- TODO: link to cataloging and discovery once implemented -->
        <!-- <v-col>
          <v-icon >mdi-database-search</v-icon>
          <div class=" has-space-bottom text-h6">Explore CZCN Data</div>
        </v-col> -->
      </v-row>
    </section>

    <v-divider />

    <section class="d-flex align-center flex-column flex-lg-row">
      <div class="text-center text-lg-left">
        <div class="has-space-bottom-2x text-h4">Make your Data FAIR</div>
        <p class="text--secondary text-subtitle-1">
          This Data Submission Portal works with reputable Earth Science
          repositories to ensure that research products you submit are
          <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and
          <u>R</u>eusable.
        </p>
      </div>

      <div
        class="has-space-top-2x text-center text-sm-center text-right flex-shrink-0"
      >
        <a
          href="https://www.go-fair.org/fair-principles/"
          class="d-block full-width"
          target="_blank"
          style="max-width: 100%"
        >
          <img
            :src="require('@/assets/img/fair.png')"
            alt="FAIR"
            style="max-width: 100%"
          />
        </a>
      </div>
    </section>

    <v-divider />

    <section>
      <div class="has-space-bottom text-center text-h4">
        Supported Repositories
      </div>
      <div class="d-flex justify-center has-space-bottom-2x">
        <p class="text--secondary text-center text-subtitle-1">
          Data submitted via this Portal are deposited in multiple repositories.
          Click the links below to learn more about each of the supported
          repositories.
        </p>
      </div>
      <div
        class="repos has-space-bottom-2x d-flex flex-wrap align-center justify-center"
      >
        <a
          v-for="repo of supportedRepositories"
          :key="repo.key"
          :href="repo.url"
          target="_blank"
          ><img :src="repo.logoSrc" :alt="repo.name"
        /></a>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { repoMetadata } from "../submit/constants";
import { DISCOVERY_SITE_URL } from "@/constants";
import User from "@/models/user.model";

@Component({
  name: "cz-home",
  components: {},
})
export default class CzHome extends Vue {
  protected repoMetadata = repoMetadata;
  protected discoverySiteUrl = DISCOVERY_SITE_URL

  protected get isLoggedIn() {
    return User.$state.isLoggedIn;
  }

  protected get supportedRepositories() {
    return Object.keys(repoMetadata)
      .map((key) => repoMetadata[key])
      .filter((repo) => !repo.isExternal && repo.isSupported);
  }

  protected openLogInDialog() {
    User.openLogInDialog();
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

::v-deep .v-parallax__content {
  padding: 0;
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
}

.repos {
  gap: 2rem 4rem;

  a {
    max-width: 100%;

    img {
      max-height: 5rem;
      max-width: 100%;
    }
  }
}
</style>
