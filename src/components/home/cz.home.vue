<template>
  <div class="cz-home">
    <v-parallax
      class="text-center"
      src="/img/bg-3.jpg"
      :height="isLoggedIn ? 450 : 650"
      :scale="1"
    >
      <v-container
        class="d-flex flex-column justify-center align-center full-height pa-12"
        :style="{
          'background-image':
            'linear-gradient(rgb(66 142 218 / 52%),rgb(0 0 0 / 38%))',
        }"
      >
        <div class="has-text-shadow">
          <div class="has-text-white text-h3">
            {{ $t("home.banner.title") }}
          </div>

          <div class="has-text-white mt-4 text-h4">
            {{ $t("home.banner.subtitle") }}
          </div>
        </div>
        <template v-if="!isLoggedIn">
          <div>
            <div class="has-text-white mt-4 mb-4 has-text-shadow text-h6">
              Ready to Submit Data?
            </div>
            <v-btn rounded @click="openLogInDialog()">
              Log In
            </v-btn>
          </div>
        </template>
        <div class="mt-16">
          <div class="has-text-shadow has-text-white text-h6 mb-2">
            {{ $t("home.banner.portalLinkHint") }}
          </div>
          <v-btn color="white" :href="discoverySiteUrl">
            {{ $t("home.banner.portalLinkText") }}
          </v-btn>
        </div>
      </v-container>
    </v-parallax>

    <section>
      <div>
        <div class="text-center d-flex flex-column align-center">
          <div class="mb-4 text-h4">
            {{ $t("home.submitData.title") }}
          </div>
          <p class="font-weight-light text-center text-subtitle-1">
            {{ $t("home.submitData.description") }}
          </p>
        </div>

        <v-row id="features-1" justify="center" align="baseline" class="mt-4">
          <v-col
            class="d-flex align-center align-md-start flex-md-row flex-column"
          >
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div class="text-md-left text-center">
              <div class="text-h6">
                {{ $t("home.submitData.points[0].title") }}
              </div>
              <p class="font-weight-light text-subtitle-1">
                {{ $t("home.submitData.points[0].description") }}
              </p>
            </div>
          </v-col>

          <v-col
            class="d-flex align-center align-md-start flex-md-row flex-column"
          >
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div class="text-md-left text-center">
              <div class="text-h6">
                {{ $t("home.submitData.points[1].title") }}
              </div>
              <p class="font-weight-light text-subtitle-1">
                {{ $t("home.submitData.points[1].description") }}
              </p>
            </div>
          </v-col>

          <v-col
            class="d-flex align-center align-md-start flex-md-row flex-column"
          >
            <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            <div class="text-md-left text-center">
              <div class="text-h6">
                {{ $t("home.submitData.points[2].title") }}
              </div>
              <p class="font-weight-light text-subtitle-1">
                {{ $t("home.submitData.points[2].description") }}
              </p>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <v-divider />

    <section class="text-center">
      <div class="mb-4 text-h4">
        What do you want to do?
      </div>
      <v-row id="features-2" justify="center">
        <v-col>
          <v-btn size="100" flat icon="mdi-book-plus" :to="{ path: '/submit' }" />

          <router-link
            to="/submit"
            class="text-h6"
          >
            <div class="my-2">
              Submit Data Products
            </div>
          </router-link>

          <div class="font-weight-light text-subtitle-1">
            Assemble your data files and metadata using our templates and submit
            directly to a supported repository.
          </div>
        </v-col>

        <v-col>
          <v-btn size="100" flat icon="mdi-arrow-decision" :to="{ path: '/resources/recommendations' }" />
          <router-link
            to="/resources/recommendations"
            class="text-h6"
          >
            <div class="my-2">
              Find the Right Repository
            </div>
          </router-link>

          <div class="font-weight-light text-subtitle-1">
            Don't know which repository to use? Use our repository
            recommendation system to decide which repository is the best place
            for your data.
          </div>
        </v-col>

        <!-- <v-col>
          <a
            to=""
          >
            <div><v-icon>mdi-database-search</v-icon></div>
          </a>

          <a
            href=""
            class="my-2 text-h6"
          >
            <div>Explore CZCN Data</div>
          </a>
        </v-col> -->
      </v-row>
    </section>

    <v-divider />

    <section class="d-flex align-center justify-center flex-column flex-lg-row">
      <div class="text-center text-lg-left">
        <div class="mb-4 text-h4">
          Make your Data FAIR
        </div>
        <p class="font-weight-light text-subtitle-1">
          This {{ $t("portalName") }} works with reputable Earth Science
          repositories to ensure that research products you submit are
          <u>F</u>indable, <u>A</u>ccessible, <u>I</u>nteroperable, and
          <u>R</u>eusable.
        </p>
      </div>

      <div class="mt-4 text-center text-sm-center text-right flex-shrink-0">
        <a
          href="https://www.go-fair.org/fair-principles/"
          class="d-block full-width"
          target="_blank"
          style="max-width: 100%"
        >
          <img
            src="/img/fair.png"
            alt="FAIR"
            style="max-width: 100%"
          >
        </a>
      </div>
    </section>

    <v-divider />

    <section>
      <div class="mb-2 text-center text-h4">
        Supported Repositories
      </div>
      <div class="d-flex justify-center mb-4">
        <p class="font-weight-light text-center text-subtitle-1">
          You can submit data to HydroShare and EarthChem directly through this Data Submission Portal.
          <br>Click the links below to learn more about HydroShare and EarthChem.
        </p>
      </div>
      <div class="repos mb-4 d-flex flex-wrap align-center justify-center">
        <a
          v-for="repo of supportedRepositories"
          :key="repo.key"
          :href="repo.url"
          :title="repo.name"
          target="_blank"
        ><img :src="repo.logoSrc" :alt="repo.name"></a>
      </div>
      <div class="d-flex justify-center mt-8">
        <p class="font-weight-light text-center text-subtitle-1">
          You can also register datasets submitted to other repositories here so that they will be discoverable by Critical Zone Scientists. You can register data submitted to any repository, but the following are some common examples.
        </p>
      </div>
      <div class="repos my-4 d-flex flex-wrap align-center justify-center">
        <a
          v-for="repo of exampleExternalRepositories"
          :key="repo.key"
          :href="repo.url"
          :title="repo.name"
          target="_blank"
        ><img class="small" :src="repo.logoSrc" :alt="repo.name"></a>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import type {
  IRepository,
} from '~/components/submissions/types'
import { Component, toNative, Vue } from 'vue-facing-decorator'
import { useRouter } from 'vue-router'
import {
  EnumRepositoryKeys,
} from '~/components/submissions/types'
import { DISCOVERY_SITE_URL } from '~/constants'
import User from '~/models/user.model'
import { repoMetadata } from '../submit/constants'

@Component({
  name: 'cz-home',
  components: {},
})
class CzHome extends Vue {
  repoMetadata = repoMetadata
  discoverySiteUrl = DISCOVERY_SITE_URL
  router = useRouter()

  get isLoggedIn() {
    return User.$state.isLoggedIn
  }

  get supportedRepositories() {
    return Object.keys(repoMetadata)
      .map(key => repoMetadata[key])
      .filter(repo => !repo.isExternal && repo.isSupported?.form)
  }

  get exampleExternalRepositories(): Partial<IRepository>[] {
    return [
      repoMetadata[EnumRepositoryKeys.essDive],
      repoMetadata[EnumRepositoryKeys.edi],
      repoMetadata[EnumRepositoryKeys.zenodo],
      repoMetadata[EnumRepositoryKeys.scienceBase],
      repoMetadata[EnumRepositoryKeys.openTopography],
    ]
  }

  openLogInDialog() {
    User.openLogInDialog()
  }
}
export default toNative(CzHome)
</script>

<style lang="scss" scoped>
p {
  max-width: 70rem;
}

section {
  padding: 4rem;
}

:deep(.v-parallax__content) {
  padding: 0;
}

.v-icon {
  color: rgba(0, 0, 0, 0.54) !important;
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

  :deep(.v-icon) {
    font-size: 5rem;
    color: rgba(0, 0, 0, 0.54);
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

    img.small {
      max-height: 3rem;
      max-width: 100%;
    }
  }
}
</style>
