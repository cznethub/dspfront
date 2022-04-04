<template>
  <div class="cz-recommendations-questionaire pa-4">
    <div class="text-h4">Repository Recommendations</div>
    <v-divider class="has-space-bottom" />

    <v-stepper v-model="currentStepIndex" flat outlined>
      <v-stepper-header>
        <template v-for="(step, index) in steps">
          <v-stepper-step :key="`${index}-step`"
            :complete="currentStepIndex > index" :step="index" editable edit-icon="mdi-check">
            <div>{{ step.next || 'Recommendations' }}</div>
            <v-chip v-if="step.selectedOption" class="mt-2" color="success">{{ step.selectedOption.label }}</v-chip>
          </v-stepper-step>

          <v-divider v-if="index < steps.length" :key="index" />
        </template>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content v-for="(step, index) in steps" :key="`${index}-content`" :step="index">
          <template v-if="step.options">
            <v-card class="mb-12 pa-4" outlined min-height="300px">
              <div class="text-heading-5">{{ step.next }}</div>
              <v-radio-group v-model="step.selectedOption" @change="onOptionChanged" column>
                <v-radio
                  v-for="(option, index) of step.options" :key="index"
                  :label="option.label"
                  :value="option"
                  color="success"
                />
              </v-radio-group>
            </v-card>

            <v-btn color="primary" @click="nextStep(step.selectedOption)" :disabled="!step.selectedOption">Continue</v-btn>
          </template>

          <template v-if="step.finish">
            <div>
              <div class="text-heading-5 mb-8">Recommended Repositories:</div>
              <template v-if="getRepoMetadataFromKeys(step.finish.prefer).length">
                <div class="repositories justify-space-around px-4">
                  <cz-repository-submit-card v-for="preferred in getRepoMetadataFromKeys(step.finish.prefer)" :repo="preferred" :key="preferred.key" class="mb-2" />
                </div>
              </template>
              <div class="text-subtitle-1 text--secondary" v-else>We have nothing specific to recommend for your query.</div>
            </div>

            <div v-if="step.finish.consider && getRepoMetadataFromKeys(step.finish.consider).length">
              <div class="text-heading-5 my-8">Also consider:</div>
              <div class="repositories justify-space-around px-4">
                <template v-for="considered in getRepoMetadataFromKeys(step.finish.consider)">
                  <cz-repository-submit-card :repo="considered" :key="considered.key" class="mb-2" />
                </template>
              </div>
            </div>
          </template>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { EnumRepositoryKeys, IRepository } from '../submissions/types'
  import { repoMetadata } from '@/components/submit/constants'
  import CzRepositorySubmitCard from '@/components/submit/cz.repository-submit-card.vue'

  const mappings: CzStep = require('@/components/recommendations/mapping.json')

  interface CzStep {
    next?: string,
    finish?: {
      prefer: EnumRepositoryKeys[],
      consider?: EnumRepositoryKeys[]
    },
    selectedOption?: CzStep,
    options?: CzStep[]
  }

  @Component({
    name: 'cz-recommendations-questionaire',
    components: { CzRepositorySubmitCard },
  })
  export default class CzRecommendationsQuestionaire extends Vue {
    protected currentStepIndex = 0
    protected steps: CzStep[] = [mappings]
    protected selectedOption = null
    protected repoMetadata = repoMetadata

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
      return repoKeys
        .filter(key => !!this.repoMetadata[key])
        .map(key => this.repoMetadata[key])
        // Uncomment if we want to sort supported repositories first
        // .sort((a, b) => {
        //   if (a.isSupported === b.isSupported) {
        //     return 0
        //   }
          
        //   return a.isSupported ? -1 : 1
        // })
    }

    protected onOptionChanged(option: CzStep) {
      this._trimFurtherSteps()
    }

    private _trimFurtherSteps() {
      this.steps = this.steps.slice(0, this.currentStepIndex + 1)
    }

    created() {
      // console.log(mappings)
    }
  }
</script>

<style lang="scss" scoped>
  .v-stepper__header {
    height: unset;

    .v-stepper__step {
      align-items: flex-start;
    }

    .v-stepper__step--active {
      background: rgba(0,0,0,0.05);
    }
  }

  .repositories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
    gap: 2rem;
  }
</style>
