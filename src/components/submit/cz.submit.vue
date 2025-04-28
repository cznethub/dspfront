<template>
  <div class="cz-submit">
    <template v-if="isInSubmitLandingPage">
      <div
        class="banner text-center"
        :style="{
          'background-image':
            `linear-gradient(180deg, rgba(30, 36, 58, 0.35), rgba(28, 37, 65, 0.3)), url(${
              '/img/bg-1.jpg'
            })`,
        }"
      >
        <div>
          <div class="has-text-white text-h2 has-text-shadow">
            Submit Data
          </div>
          <div class="has-text-white mt-4 mb-2 text-h4 has-text-shadow">
            Not sure which repository to use?
          </div>
          <v-btn to="/resources/recommendations">
            Help Me Decide
          </v-btn>
        </div>
      </div>

      <v-container>
        <div class="text-h4 my-8 text-center">
          Repositories
        </div>

        <div class="mb-4">
          <div class="repositories justify-space-around px-4">
            <cz-repository-submit-card
              v-for="repo of supportedRepoMetadata"
              :key="repo.key"
              :repo="repo"
              @click.enter="submitTo(repo)"
            />
            <cz-repository-submit-card
              :repo="externalRepoMetadata"
              @click.enter="openRegisterDatasetDialog"
            />
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
import type { RouteLocationNormalized } from 'vue-router'
import type { IRepository } from '../submissions/types'
import { Notifications } from '@cznethub/cznet-vue-core'
import { Component, mixins, Ref, toNative } from 'vue-facing-decorator'
import { useRoute } from 'vue-router'
import CzRegisterDatasetDialog from '~/components/register-dataset/cz.register-dataset-dialog.vue'
import { repoMetadata } from '~/components/submit/constants'
import CzRepositorySubmitCard from '~/components/submit/cz.repository-submit-card.vue'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'
import User from '~/models/user.model'

@Component({
  name: 'cz-submit',
  components: { CzRepositorySubmitCard, CzRegisterDatasetDialog },
})
class CzSubmit extends mixins(ActiveRepositoryMixin) {
  @Ref('registerDatasetDialog') registerDatasetDialog!: InstanceType<
    typeof CzRegisterDatasetDialog
  >

  route = useRoute()

  get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata).map(r => repoMetadata[r])
  }

  get supportedRepoMetadata() {
    return this.repoCollection.filter(r => !r.isExternal && r.isSupported?.form)
  }

  get externalRepoMetadata() {
    return this.repoCollection.find(r => r.isExternal)
  }

  get isInSubmitLandingPage() {
    return !(this.route as RouteLocationNormalized).params.repository
  }

  openRegisterDatasetDialog() {
    this.registerDatasetDialog.active = true
  }

  created() {
    // TODO: this should be a notification system in the API with a dedicated endpoint
    if (this.route.name === 'submit' && User.$state.showZenodoWarning) {
      Notifications.toast({
        title: `Important Note: As of May 2025, we have removed submission of datasets to the Zenodo repository directly through this Data Submission Portal.`,
        message: `Issues and changes with Zenodo's API and API documentation made it very difficult for us to continue supporting this functionality. We highly encourage you to submit CZNet datasets to the HydroShare and EarthChem repositories. If you need to use Zenodo, you should go directly to the Zenodo website to create your resource. Then, make sure you come back here and use the "Register Dataset" option to register your dataset. This will ensure that anything you submit to Zenodo becomes discoverable with all other CZNet data. Make sure your resource is publicly available in Zenodo before you try to register it here.`,
        isInfinite: true,
        type: 'warning',
        hasDoNotShowAgain: true,
        location: 'top center',
        onDismissed: (doNotShowAgain: boolean) => {
          if (doNotShowAgain) {
            User.commit((state) => {
              state.showZenodoWarning = false
            })
          }
        },
      })
    }
    else {
      User.commit((state) => {
        state.showZenodoWarning = true
      })
    }
  }
}
export default toNative(CzSubmit)
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
