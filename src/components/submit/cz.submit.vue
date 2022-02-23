<template>
  <div class="cz-submit">
    <template v-if="isInSubmitLandingPage">
      <div class="banner text-center"
        :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.35), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-1.jpg') + ')' }">
        <div>
          <div class="has-text-white text-h2 has-text-shadow">Submit Data</div>
          <div class="has-text-white has-space-top-2x has-space-bottom text-h4 has-text-shadow">Not sure which repository to use?</div>
          <v-btn to="/resources/recommendations">Help Me Decide</v-btn>
        </div>
      </div>

      <v-container>
        <div class="text-h4 has-space-bottom-2x text-center has-space-top-2x">Submit to a Supported Repository</div>

        <div class="has-space-bottom-2x">
          <div class="repositories justify-space-around">
            <template  v-for="repo of repoMetadata">
              <v-hover :key="repo.key">
                <template v-slot:default="{ hover }">
                  <v-card  @click.native="submitTo(repo)"
                    class="has-cursor-pointer transition-swing"
                    max-width="40rem"
                    :disabled="repo.isDisabled"
                    :class="`elevation-${ hover ? 12 : 2 }`">
                    <v-card-title class="v-card-media justify-center">
                      <img :src="repo.logoSrc" :alt="repo.name">
                    </v-card-title>

                    <v-card-title>
                      <div class="text-h4">{{ repo.name }}</div>
                    </v-card-title>

                    <v-card-text class="text--secondary">
                      <div class="text-subtitle-1">{{ repo.description }}</div>
                      
                      <template v-if="repo.isDisabled">
                        <v-divider class="has-space-top has-space-bottom" />
                        <v-chip>Coming soon...</v-chip>
                      </template>
                    </v-card-text>
                  </v-card>
                </template>
              </v-hover>
            </template>
          </div>
        </div>
      </v-container>

      <v-divider />

      <v-container class="d-flex repositories flex-column align-center">
        <div class="text-h4 has-space-bottom-2x has-space-top-2x">Register a product submitted to another repository</div>
        <v-hover>
          <template v-slot:default="{ hover }">
            <v-card  @click.native="submitTo(externalRepoMetadata)"
              class="has-cursor-pointer transition-swing mb-4"
              max-width="40rem"
              :disabled="externalRepoMetadata.isDisabled"
              :class="`elevation-${ hover ? 12 : 2 }`">
              <v-card-title class="v-card-media justify-center">
                <div class="d-flex justify-center flex-grow-1"><v-icon>mdi-cloud</v-icon></div>
              </v-card-title>
              <v-divider></v-divider>

              <v-card-text class="text--secondary">
                <div class="text-subtitle-1">{{ externalRepoMetadata.description }}</div>
                
                <template v-if="externalRepoMetadata.isDisabled">
                  <v-divider class="has-space-top has-space-bottom" />
                  <v-chip>Coming soon...</v-chip>
                </template>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>
      </v-container>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { mixins } from 'vue-class-component'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'

  @Component({
    name: 'cz-submit',
    components: { },
  })
  export default class CzSubmit extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
    protected get repoCollection() {
      return Object.keys(repoMetadata)
        .map(r => repoMetadata[r])
    }

    protected get repoMetadata() {
      return this.repoCollection.filter(r => !r.isExternal)
    }

    protected get externalRepoMetadata() {
      return this.repoCollection.find(r => r.isExternal)
    }

    protected get isInSubmitLandingPage() {
      return !(this.$route.params.repository)
    }
  }
</script>

<style lang="scss" scoped>
  section {
    padding: 4rem 0;
  }

  .banner {
    padding: 4rem 2rem;
    background: var(--bg-light-gray);
  }

  .repositories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
    gap: 2rem;

    ::v-deep .v-card-media {
      background: linear-gradient(135deg, #f1f3f5 0%, #cfd8dc 100%);
      height: 10rem; 
      padding: 2rem;

      img {
        height: 100%;
        flex: 0;
      }

      .v-icon {
        font-size: 7rem;
      }
    }
  }

  .banner {
    background-size: cover;
    background-repeat: no-repeat;
    padding-top: 9rem;
    padding-bottom: 9rem;
    margin-bottom: 2rem;
    min-height: 30rem;
    flex-direction: column;
  }
</style>
