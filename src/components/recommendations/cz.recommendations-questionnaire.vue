<template>
  <div class="cz-recommendations-questionnaire pa-4">
    <div class="text-h4">Repository Recommendations</div>
    <v-divider class="mb-4" />
    <p class="text-body-1 mb-8">
      Use the questionnaire below to identify repository options for different
      types of data. If you cannot find guidance for your particular data or
      still have questions, please
      <span><router-link to="/contact">contact us</router-link></span
      >.
    </p>

    <p class="text-body-1 mb-8">
      <b>Important</b>: Some partnership agreements for data collection or
      journals to which you submit papers may require that associated data be
      deposited in a specific repository. We hope the repository recommendations
      provided here are helpful, but realize that they may be superseded by
      other requirements. We recommend that you address any of these issues
      before using this guide.
    </p>

    <div v-if="steps.length > 1" class="mb-4">
      <v-btn
        variant="outlined"
        size="small"
        prepend-icon="mdi-refresh"
        @click="resetQuestionnaire"
      >
        Start Over
      </v-btn>
    </div>

    <v-stepper-vertical v-model="currentStepIndex" flat>
      <template #default="{ step }">
        <template v-for="(s, index) in steps" :key="`${index}-step`">
          <v-stepper-vertical-item
            color="primary"
            :complete="step > index + 1 || !!s.finish"
            :editable="step > index + 1"
            :value="index + 1"
            edit-icon="mdi-check"
          >
            <template #title>
              <div class="text-h6">
                {{ s.next || "Recommendations" }}
              </div>
            </template>

            <template #subtitle>
              <v-chip v-if="s.selectedOption" class="mt-2 bg-success">
                {{ s.selectedOption.label }}
              </v-chip>
            </template>

            <template v-if="s.options">
              <v-card
                class="pa-4 borther-thin"
                border="solid thin"
                flat
                min-height="300px"
              >
                <v-radio-group
                  v-model="s.selectedOption"
                  @change="onOptionChanged"
                >
                  <v-radio
                    v-for="(option, rIndex) of s.options"
                    :key="rIndex"
                    :label="option.label"
                    :value="option"
                    color="success"
                  />
                </v-radio-group>
              </v-card>
            </template>

            <template v-if="s.finish">
              <v-alert
                v-if="s.finish.linkToGuide"
                class="my-8 text-subtitle-1"
                border="start"
                colored-border
                type="info"
                variant="outlined"
              >
                <p>
                  View guidance and best practices for "{{
                    enumDataTemplateType[s.finish.linkToGuide]
                  }}" data
                  <a :href="guideUrls[s.finish.linkToGuide]" target="_blank"
                    >here</a
                  >.
                </p>
              </v-alert>

              <div class="text-heading-5 mb-8">Recommended Repositories:</div>

              <template v-if="getRepoMetadataFromKeys(s.finish.prefer).length">
                <div class="repositories justify-space-around px-1">
                  <cz-recommendation-card
                    v-for="preferred in getRepoMetadataFromKeys(
                      s.finish.prefer,
                    )"
                    :key="preferred.key"
                    :repo="preferred"
                    :hide-logo="false"
                    class="mb-4"
                  />
                </div>
              </template>
              <div v-else class="text-subtitle-1 font-weight-light">
                We have nothing specific to recommend for this query.
              </div>

              <div
                v-if="
                  s.finish.consider &&
                  getRepoMetadataFromKeys(s.finish.consider).length
                "
              >
                <div class="text-heading-5 my-8">Also consider:</div>

                <ul class="repositories px-4">
                  <li
                    v-for="considered in getRepoMetadataFromKeys(
                      s.finish.consider,
                    )"
                    :key="considered.key"
                    class="mb-4"
                  >
                    <cz-recommendation-card :repo="considered" />
                  </li>
                </ul>
              </div>
            </template>

            <template #next>
              <v-btn
                v-if="s.selectedOption"
                class="bg-primary"
                :disabled="!s.selectedOption"
                @click="nextStep(s.selectedOption)"
              >
                Continue
              </v-btn>
            </template>
            <template #prev />
          </v-stepper-vertical-item>
        </template>
      </template>
    </v-stepper-vertical>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  VStepperVertical,
  VStepperVerticalItem,
} from 'vuetify/labs/VStepperVertical'
import { guideUrls } from '~/components/recommendations/constants'
import CzRecommendationCard from '~/components/recommendations/cz.recommendation-card.vue'
import mappings from '~/components/recommendations/mapping.json'
import { EnumDataTemplateType } from '~/components/recommendations/types'
import { repoMetadata } from '~/components/submit/constants'
import type { IRepository, EnumRepositoryKeys } from '~/components/submissions/types'

interface CzStep {
  next?: string
  options?: CzStep[]
  finish?: {
    prefer: EnumRepositoryKeys[]
    consider?: EnumRepositoryKeys[]
    linkToGuide?: keyof typeof EnumDataTemplateType
  }
  selectedOption?: CzStep
  label?: string
}

const currentStepIndex = ref(1)
const steps = ref<CzStep[]>([mappings] as CzStep[])
const enumDataTemplateType = EnumDataTemplateType

const currentStep = ref<CzStep>(steps.value[currentStepIndex.value - 1])

function nextStep(option: CzStep) {
  _trimFurtherSteps()
  currentStep.value.selectedOption = option
  steps.value.push(option)
  nextTick(() => {
    currentStepIndex.value = currentStepIndex.value + 1
  })
}

function getRepoMetadataFromKeys(repoKeys: string[]): IRepository[] {
  return repoKeys
    .filter(key => !!repoMetadata[key])
    .map(key => repoMetadata[key])
    .sort((a, b) => {
      if (a.isSupported?.form === b.isSupported?.form) return 0
      return a.isSupported?.form ? -1 : 1
    })
}

function resetQuestionnaire() {
  steps.value = [mappings] as CzStep[]
  currentStepIndex.value = 1
  currentStep.value = steps.value[0]
}

function onOptionChanged(_option: CzStep) {
  _trimFurtherSteps()
}

function _trimFurtherSteps() {
  steps.value = steps.value.slice(0, currentStepIndex.value)
}
</script>

<style lang="scss" scoped>
:deep(.v-expansion-panel-title > .v-avatar) {
  z-index: 1;
}

:deep(.v-selection-control-group) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(30rem, 100%), 1fr));

  .v-selection-control {
    grid-area: unset;
  }
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
    content: "";
    float: left;
    display: list-item;
    list-style-type: disc;
    list-style-position: inside;
    width: 2rem;
    margin-left: -2rem;
  }
}
</style>
