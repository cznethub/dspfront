<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import type { IRepository } from '../submissions/types'
import { EnumRepositoryKeys } from '../submissions/types'
import { repoMetadata } from '~/components/submit/constants'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'
import { EnumDataTemplateType } from '~/components/recommendations/types'
import { guideUrls } from '~/components/recommendations/constants'
import CzRecommendationCard from '~/components/recommendations/cz.recommendation-card.vue'

import mappings from '~/components/recommendations/mapping.json'

interface CzStep {
  next?: string // The question that must be answered to continue
  options?: CzStep[] // The options available to answer the question
  finish?: {
    // The recommendations at the end of a query
    prefer: EnumRepositoryKeys[]
    consider?: EnumRepositoryKeys[]
    linkToGuide?: boolean // Wether the user should see a link that points to our existing guidance and best practices
  }
  selectedOption?: CzStep // Used internally to track which option the user selected
}

@Component({
  name: 'cz-recommendations-questionnaire',
  components: { CzRecommendationCard },
  mixins: [ActiveRepositoryMixin],
})
export default class CzRecommendationsQuestionnaire extends Vue {
  protected currentStepIndex = 0
  protected steps: CzStep[] = [mappings] as CzStep[]
  protected selectedOption: CzStep | null = null
  protected repoMetadata = repoMetadata
  protected enumDataTemplateType = EnumDataTemplateType
  protected guideUrls = guideUrls
  protected externalRepoMetadata = repoMetadata[EnumRepositoryKeys.external]

  protected get currentStep() {
    return this.steps[this.currentStepIndex]
  }

  protected nextStep(option: CzStep) {
    this._trimFurtherSteps()
    this.currentStep.selectedOption = option
    this.steps.push(option)

    this.$nextTick(() => {
      this.currentStepIndex = this.currentStepIndex + 1
    })
  }

  protected getRepoMetadataFromKeys(repoKeys: string[]): IRepository[] {
    return (
      repoKeys
        .filter(key => !!this.repoMetadata[key])
        .map(key => this.repoMetadata[key])
        // Sort supported repositories first
        .sort((a, b) => {
          if (a.isSupported === b.isSupported)
            return 0

          return a.isSupported ? -1 : 1
        })
    )
  }

  protected onOptionChanged(option: CzStep) {
    this._trimFurtherSteps()
  }

  private _trimFurtherSteps() {
    this.steps = this.steps.slice(0, this.currentStepIndex + 1)
  }
}
</script>

<template>
  <div class="cz-recommendations-questionnaire pa-4">
    <div class="text-h4">
      Repository Recommendations
    </div>
    <v-divider class="mb-2" />
    <p class="text-body-1 mb-8">
      Use the questionnaire below to identify repository options for different
      types of data. If you cannot find guidance for your particular data or
      still have questions, please
      <router-link to="/contact">
        contact us
      </router-link>.
    </p>

    <p class="text-body-1 mb-8">
      <b>Important</b>: Some partnership agreements for data collection or
      journals to which you submit papers may require that associated data be
      deposited in a specific repository. We hope the repository recommendations
      provided here are helpful, but realize that they may be superseded by
      other requirements. We recommend that you adress any of these issues
      before using this guide.
    </p>

    <v-stepper v-model="currentStepIndex" flat outlined>
      <v-stepper-header>
        <template v-for="(step, index) in steps" :key="`${index}-step`">
          <v-stepper-step
            :complete="currentStepIndex > index"
            :step="index"
            editable
            edit-icon="mdi-check"
          >
            <div>{{ step.next || "Recommendations" }}</div>
            <v-chip v-if="step.selectedOption" class="mt-2" color="success">
              {{
                step.selectedOption.label
              }}
            </v-chip>
          </v-stepper-step>

          <v-divider v-if="index < steps.length" :key="index" />
        </template>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content
          v-for="(step, index) in steps"
          :key="`${index}-content`"
          :step="index"
        >
          <template v-if="step.options">
            <v-card class="mb-12 pa-4" outlined min-height="300px">
              <div class="text-heading-5">
                {{ step.next }}
              </div>
              <v-radio-group
                v-model="step.selectedOption"
                @change="onOptionChanged"
              >
                <v-radio
                  v-for="(option, index) of step.options"
                  :key="index"
                  :label="option.label"
                  :value="option"
                  color="success"
                />
              </v-radio-group>
            </v-card>

            <v-btn
              color="primary"
              :disabled="!step.selectedOption"
              @click="nextStep(step.selectedOption)"
            >
              Continue
            </v-btn>
          </template>

          <template v-if="step.finish">
            <v-alert
              class="my-8"
              outlined
              type="warning"
              color="warning darken-2"
              prominent
              border="left"
            >
              <div class="text-body-1">
                If you are a CZ Net data manager or investigator and you choose
                to submit data to a repository other than HydroShare, EarthChem,
                or Zenodo, please use the
                <a @click="submitTo(externalRepoMetadata)">Register Dataset</a>
                form to provide metadata about those datasets. If you submit to
                HydroShare, EarthChem or Zenodo through the Data Submission
                Portal, we will automatically harvest your metadata for you to
                support CZ Net data discovery services.
              </div>
            </v-alert>

            <v-alert
              v-if="step.finish.linkToGuide"
              class="my-8"
              border="left"
              colored-border
              type="info"
              elevation="2"
            >
              <div class="text-body-1">
                View guidance and best practices for "{{
                  enumDataTemplateType[step.finish.linkToGuide]
                }}" data
                <a :href="guideUrls[step.finish.linkToGuide]" target="_blank">here</a>.
              </div>
            </v-alert>

            <div class="text-heading-5 mb-8">
              Recommended Repositories:
            </div>
            <template v-if="getRepoMetadataFromKeys(step.finish.prefer).length">
              <div class="repositories justify-space-around px-1">
                <cz-recommendation-card
                  v-for="preferred in getRepoMetadataFromKeys(
                    step.finish.prefer,
                  )"
                  :key="preferred.key"
                  :repo="preferred"
                  :hide-logo="false"
                  class="mb-4"
                />
              </div>
            </template>
            <div v-else class="text-subtitle-1 text--secondary">
              We have nothing specific to recommend for this query.
            </div>

            <div
              v-if="
                step.finish.consider
                  && getRepoMetadataFromKeys(step.finish.consider).length
              "
            >
              <div class="text-heading-5 my-8">
                Also consider:
              </div>
              <ul class="repositories px-1">
                <template
                  v-for="considered in getRepoMetadataFromKeys(
                    step.finish.consider,
                  )"
                >
                  <template v-if="considered.isSupported">
                    <li :key="considered.key">
                      <cz-recommendation-card :repo="considered" class="mb-4" />
                    </li>
                  </template>
                  <template v-else>
                    <li :key="considered.key" class="my-2">
                      <div>{{ considered.name }}</div>
                      <div class="text-subtitle-1 text--secondary">
                        {{ considered.description }}
                      </div>
                      <v-icon class="mr-2">
                        mdi-open-in-new
                      </v-icon><a
                        class="text-subtitle-1"
                        :href="considered.url"
                        target="_blank"
                      >Visit {{ considered.name }}</a>
                    </li>
                  </template>
                </template>
              </ul>
            </div>
          </template>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<style lang="scss" scoped>
.v-stepper__header {
  height: unset;

  .v-stepper__step {
    align-items: flex-start;

    :deep(.v-stepper__step__step) {
      color: transparent;
    }
  }

  .v-stepper__step--active {
    background: rgba(0, 0, 0, 0.05);
  }
}

:deep(.v-input--radio-group__input) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(30rem, 100%), 1fr));
}

:deep(.v-alert a) {
  text-decoration: underline;
}

.repositories {
  display: flex;
  flex-direction: column;

  li {
    list-style-type: none;
    padding-left: 2rem;
  }

  li:before {
    content: '';
    float: left;
    display: list-item;
    list-style-type: disc;
    list-style-position: inside;
    width: 2rem;
    margin-left: -2rem;
  }
}
</style>
