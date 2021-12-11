<template>
  <div class="cz-submit">
    <template v-if="isInSubmitLandingPage">
      <div class="banner has-text-centered has-text-shadow md-layout md-alignment-center-center"
        :style="{ 'background-image': 'linear-gradient(180deg, rgba(30, 36, 58, 0.35), rgba(28, 37, 65, 0.3)), url(' + require('@/assets/img/bg-1.jpg') + ')' }">
        <div class="">
          <h1 class="md-display-2 has-text-white">Submit Data</h1>
          <h2 class="md-display-1 has-text-white has-space-top-2x has-space-bottom">Not sure which repository to use?</h2>
          <router-link to="/recommendations">
            <v-btn class="md-raised">Help Me Decide</v-btn>
          </router-link>
        </div>
      </div>

      <section>
        <h1 class="md-display-1 has-space-bottom-2x has-text-centered has-space-top-2x">Submit to a Supported Repository</h1>

        <div class="has-space-bottom-2x">
          <div class="repositories">
            <v-card v-for="repo of repoMetadata" :key="repo.key" @click.native="submitTo(repo)" class="md-primary" md-theme="grey-card" :md-with-hover="!repo.isDisabled">
              <div class="md-layout md-alignment-center-center" style="height: 10rem; padding: 2rem;">
                <img :src="repo.logoSrc" :alt="repo.name" class="md-layout-item">
              </div>
              <div>
                <div class="md-title">{{ repo.name }}</div>
                
              </div>
              <div class="has-text-mute">
                <div>{{ repo.description }}</div>
                
                <template v-if="repo.isDisabled">
                  <hr>
                  <v-chip>Coming soon...</v-chip>
                </template>
              </div>
            </v-card>
          </div>
        </div>
      </section>

      <hr>

      <section class="md-layout md-gutter">
        <div class="md-layout-item md-size-50 md-small-size-100 has-space-bottom-2x">
          <h1 class="md-display-1">Register a product submitted to another repository</h1>
          <p class="has-text-mute">The repositories above may not be a good fit for every CZCN dataset. If you decide to submit a dataset with another repository, register it here. Registering will create a metadata record for the dataset within the HydroShare repository to ensure that your data can still be discovered with all of the other CZCN research products.</p>
          <v-btn class="md-raised md-accent">Register</v-btn>
        </div>
        <v-icon class="md-size-5x md-layout-item" style="font-size: 20rem !important;">cloud_done</v-icon>
        <!-- <img class="md-layout-item md-size-50 md-small-size-100" :src="require('@/assets/img/placeholder.png')" alt=""> -->
      </section>
    </template>
    <template v-else>
      <router-view></router-view>
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
  $md-padding: 17px;

  section {
    padding: 4rem 0;
  }

  .banner {
    padding: 4rem 2rem;
    background: var(--bg-light-gray);
  }

  .repositories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40rem, 1fr));
    justify-content: space-around;
    gap: 2rem;

    .v-card-media {
      background: linear-gradient(135deg, #f1f3f5 0%, var(--md-theme-default-primary) 100%);

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
    margin: -$md-padding;
    margin-bottom: 2rem;
    min-height: 30rem;
    flex-direction: column;
  }
</style>
