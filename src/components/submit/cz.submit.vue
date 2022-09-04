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
              @click.native="openRegisterDatasetDialog" />
          </div>
        </div>
      </v-container>

      <cz-register-dataset-dialog ref="registerDatasetDialog" />
    </template>

    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script lang="ts">
  import { Component, Ref, Vue } from 'vue-property-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { IRepository } from '../submissions/types'
  import CzRepositorySubmitCard from '@/components/submit/cz.repository-submit-card.vue'
  import CzRegisterDatasetDialog from '@/components/register-dataset/cz.register-dataset-dialog.vue'

  @Component({
    name: 'cz-submit',
    components: { CzRepositorySubmitCard, CzRegisterDatasetDialog },
  })
  export default class CzSubmit extends Vue {
    @Ref("registerDatasetDialog") registerDatasetDialog!: InstanceType<typeof CzRegisterDatasetDialog>

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

    protected openRegisterDatasetDialog() {
      this.registerDatasetDialog.active = true
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
</style>
