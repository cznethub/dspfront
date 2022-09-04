<template>
  <div class="cz-submit">
    <template v-if="isInSubmitLandingPage">
      <div class="banner text-center"
        :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.35), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-1.jpg') + ')' }">
        <div>
          <div class="has-text-white text-h2 has-text-shadow">Submit Data</div>
          <div class="has-text-white mt-4 has-space-bottom text-h4 has-text-shadow">Not sure which repository to use?</div>
          <v-btn to="/resources/recommendations">Help Me Decide</v-btn>
        </div>
      </div>

      <v-container>
        <div class="text-h4 my-8 text-center">Repositories</div>

        <div class="mb-4">
          <div class="repositories justify-space-around px-4">
            <cz-repository-submit-card v-for="repo of supportedRepoMetadata"
              @click.native="submitTo(repo)"
              :repo="repo" :key="repo.key" />
            <cz-repository-submit-card :repo="externalRepoMetadata"
              @click.native="isChoiceDialogShown = true" />
          </div>
        </div>
      </v-container>

      <v-dialog v-model="isChoiceDialogShown" width="800">
        <v-card class="py-8">
          <v-card-title class="justify-center mb-4">
            What repository is the resource in?
          </v-card-title>

          <v-card-text class="choice-container gap-1"
            :class="{ 'is-xs-small': $vuetify.breakpoint.xs }">
            <v-hover>
              <template v-slot:default="{ hover }">
                <v-card class="transition-swing"
                  :to="{ path: 'register' }"
                  :class="`elevation-${ hover ? 2 : 0 }`" outlined>
                  <v-card-text class="d-flex align-items-center gap-1">
                    <v-icon color="#87AAAA">mdi-book-plus</v-icon>
                    <div>
                      <div class="text-overline mb-2">SUPPORTED REPOSITORY</div>
                      <div class="text-body-2">Register an existing dataset from HydroShare, EarthChem, or Zenodo</div>
                    </div>
                  </v-card-text>
                </v-card>
              </template>
            </v-hover>

            <v-hover>
              <template v-slot:default="{ hover }">
                <v-card class="transition-swing"
                  :class="`elevation-${ hover ? 2 : 0 }`" outlined role="button" ripple>
                  <v-card-text
                    class="d-flex align-items-center gap-1"
                    @click="isChoiceDialogShown = false; submitTo(externalRepoMetadata)">
                    <v-icon color="#C37B89">mdi-link-plus</v-icon>
                    <div>
                      <div class="text-overline mb-2">OTHER</div>
                      <div class="text-body-2">Register a dataset from a different repository</div>
                    </div>
                  </v-card-text>
                </v-card>
              </template>
            </v-hover>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script lang="ts">
  import { Component } from 'vue-property-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { IRepository } from '../submissions/types'
  import { mixins } from 'vue-class-component'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
  import CzRepositorySubmitCard from '@/components/submit/cz.repository-submit-card.vue'

  @Component({
    name: 'cz-submit',
    components: { CzRepositorySubmitCard },
  })
  export default class CzSubmit extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
    protected isChoiceDialogShown = false

    protected get repoCollection(): IRepository[] {
      return Object.keys(repoMetadata)
        .map(r => repoMetadata[r])
    }

    protected get supportedRepoMetadata() {
      return this.repoCollection.filter(r => !r.isExternal && r.isSupported)
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
  .repositories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(30rem, 100%), 1fr));
    gap: 2rem;
  }

  .banner {
    padding: 4rem 2rem;
    background: var(--bg-light-gray);
    background-size: cover;
    background-repeat: no-repeat;
    padding-top: 9rem;
    padding-bottom: 9rem;
    margin-bottom: 2rem;
    min-height: 30rem;
    flex-direction: column;
  }

  .choice-container {
    display: grid;
    grid-template-columns: auto auto;
    
    &.is-xs-small {
      display: flex;
      flex-direction: column;
    }
  }
</style>
