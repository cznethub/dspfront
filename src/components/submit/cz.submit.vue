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
                    :disabled="repo.isDisabled"
                    class="has-cursor-pointer transition-swing"
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

      <v-container class="d-flex">
        <div class="has-space-bottom-2x">
          <div class="text-h4 has-space-bottom-2x has-space-top-2x">Register a product submitted to another repository</div>
          <p class="text--secondary text-subtitle-1">The repositories above may not be a good fit for every CZCN dataset. If you decide to submit a dataset with another repository, register it here. Registering will create a metadata record for the dataset within the HydroShare repository to ensure that your data can still be discovered with all of the other CZCN research products.</p>
          <v-btn>Register</v-btn>
        </div>
        <div class="d-flex justify-center flex-grow-1 ml-4"><v-icon style="font-size: 10rem;">mdi-cloud</v-icon></div>
        <!-- <img class="  " :src="require('@/assets/img/placeholder.png')" alt=""> -->
      </v-container>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { EnumRepositoryKeys, IRepository } from '@/components/submissions/types'
  import Repository from '@/models/repository.model'

  @Component({
    name: 'cz-submit',
    components: { },
  })
  export default class CzSubmit extends Vue {
    protected get repoMetadata() {
      return Object.keys(repoMetadata).map(r => repoMetadata[r])
    }

    protected get isInSubmitLandingPage() {
      return !(this.$route.params.repository)
    }
    
    protected submitTo(repo: IRepository) {
      if (repo.isDisabled) {
        return
      }
      if (Object.keys(EnumRepositoryKeys).includes(repo.key)) {
        this.setActiveRepository(repo.key)
      }
      this.$router.push({ name: 'submit.repository', params: { repository: repo.key } }).catch(() => {})
    }

    private setActiveRepository(key: EnumRepositoryKeys) {
      Repository.commit((state) => {
        state.submittingTo = key
      })
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
