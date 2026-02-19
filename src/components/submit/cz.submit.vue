<template>
  <div class="cz-submit">
    <template v-if="isInSubmitLandingPage">
      <div
        class="banner text-center"
        :style="{
          'background-image': `linear-gradient(180deg, rgba(30, 36, 58, 0.35), rgba(28, 37, 65, 0.3)), url(${'/img/bg-1.jpg'})`,
        }"
      >
        <div>
          <div class="has-text-white text-h2 has-text-shadow">
            Register Data
          </div>
          <div class="has-text-white mt-4 mb-2 text-h4 has-text-shadow">
            Not sure which repository to use?
          </div>
          <v-btn to="/resources/recommendations"> Help Me Decide </v-btn>
        </div>
      </div>

      <v-container>
        <div class="text-h4 my-8 text-center">Repositories</div>

        <div class="mb-4">
          <div class="d-flex flex-column align-center mb-12">
            <p class="font-weight-light text-subtitle-1 text-center mb-4">
              You will need to submit your data to a reputable repository before
              you register it here. Click on the cards below to be redirected to
              repositories for submitting data and for registering samples.
              Then, come back here and register the data products you have
              submitted.
            </p>
            <cz-repository-submit-card
              :repo="externalRepoMetadata"
              @click.enter="openRegisterDatasetDialog"
              style="max-width: 45rem"
            />
          </div>

          <div class="repositories justify-space-around px-4">
            <cz-repository-submit-card
              v-for="repo of supportedRepoMetadata"
              :key="repo.key"
              :repo="repo"
              @click.enter="submitTo(repo)"
            />

            <cz-repository-submit-card
              :repo="sesarCardMetadata"
              @click.="openSesar"
            >
              <template #description="{ desc }">
                <div class="text-subtitle-1 text-medium-emphasis">
                  <p>{{ desc }}</p>
                  <br />
                  <p>
                    For instructions and best practices related to registering
                    samples, visit our
                    <a :href="guideUrls.main" target="_blank" @click.stop=""
                      >CZNet data best practices</a
                    >.
                  </p>
                </div>
              </template>
            </cz-repository-submit-card>

            <cz-repository-submit-card :repo="hsCardMetadata" @click.="openHs">
              <template #description="{ desc }">
                <div class="text-subtitle-1 text-medium-emphasis">
                  <p>{{ desc }}</p>
                </div>
              </template>
            </cz-repository-submit-card>

            <cz-repository-submit-card :repo="ecCardMetadata" @click.="openEc">
              <template #description="{ desc }">
                <div class="text-subtitle-1 text-medium-emphasis">
                  <p>{{ desc }}</p>
                </div>
              </template>
            </cz-repository-submit-card>
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
import type { RouteLocationNormalized } from "vue-router";
import { EnumRepositoryKeys, type IRepository } from "../submissions/types";
import { Notifications } from "@cznethub/cznet-vue-core";
import { Component, mixins, Ref, toNative } from "vue-facing-decorator";
import { useRoute } from "vue-router";
import CzRegisterDatasetDialog from "~/components/register-dataset/cz.register-dataset-dialog.vue";
import { repoMetadata } from "~/components/submit/constants";
import CzRepositorySubmitCard from "~/components/submit/cz.repository-submit-card.vue";
import { ActiveRepositoryMixin } from "~/mixins/activeRepository.mixin";
import User from "~/models/user.model";
import { guideUrls } from "../recommendations/constants";

@Component({
  name: "cz-submit",
  components: { CzRepositorySubmitCard, CzRegisterDatasetDialog },
})
class CzSubmit extends mixins(ActiveRepositoryMixin) {
  @Ref("registerDatasetDialog") registerDatasetDialog!: InstanceType<
    typeof CzRegisterDatasetDialog
  >;

  route = useRoute();
  guideUrls = guideUrls;

  sesarCardMetadata = {
    ...repoMetadata[EnumRepositoryKeys.sesar],
    name: "Register Samples",
  };

  hsCardMetadata = {
    ...repoMetadata[EnumRepositoryKeys.hydroshare],
  };

  ecCardMetadata = {
    ...repoMetadata[EnumRepositoryKeys.earthchem],
  };

  get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata).map((r) => repoMetadata[r]);
  }

  get supportedRepoMetadata() {
    return this.repoCollection.filter(
      (r) => !r.isExternal && r.isSupported?.form,
    );
  }

  get externalRepoMetadata() {
    return this.repoCollection.find((r) => r.isExternal);
  }

  get isInSubmitLandingPage() {
    return !(this.route as RouteLocationNormalized).params.repository;
  }

  openRegisterDatasetDialog() {
    this.registerDatasetDialog.active = true;
  }

  openSesar() {
    window.open(this.sesarCardMetadata.url, "_blank");
  }

  openEc() {
    window.open(this.ecCardMetadata.url, "_blank");
  }

  openHs() {
    window.open(this.hsCardMetadata.url, "_blank");
  }

  created() {
    // TODO: this should be a notification system in the API with a dedicated endpoint
    if (
      this.route.name === "register-data" &&
      User.$state.showSubmissionWarning
    ) {
      Notifications.toast({
        title: `NOTE: As of February 2026, we have removed functionality for submitting datasets to repositories through this Data Submission Portal.`,
        message: `Please submit your data directly to your chosen repository (e.g., HydroShare or EarthChem) and then come back here to register your submitted data products with the Data Submission Portal.

IMPORTANT: Your repository submissions will not be discoverable in the CZNet data collection if you do not register them with this Data Submission Portal.
`,
        isInfinite: true,
        type: "warning",
        hasDoNotShowAgain: true,
        location: "top center",
        onDismissed: (doNotShowAgain: boolean) => {
          if (doNotShowAgain) {
            User.commit((state) => {
              state.showSubmissionWarning = false;
            });
          }
        },
      });
    }
  }
}
export default toNative(CzSubmit);
</script>

<style lang="scss" scoped>
.repositories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(25rem, 100%), 1fr));
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
