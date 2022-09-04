<template>
  <v-container class="cz-register-dataset">
    <div class="text-h4">Register Dataset</div>
    <v-divider class="has-space-bottom" />

    <v-stepper v-model="step" vertical flat>
      <v-stepper-step :complete="step > 1" step="1" :editable="!isFetching && step > 1" edit-icon="mdi-check">
        <div>What repository is the resource in?</div>
        <v-chip v-if="selectedRepository && step > 1" class="mt-2" color="success">{{ selectedRepository.name }}</v-chip>
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-radio-group v-model="selectedRepository">
          <v-radio v-for="repo of supportedRepoMetadata" :key="repo.key" :value="repo" :label="repo.name">
          </v-radio>
        </v-radio-group>
        
        <v-btn color="primary" @click="step = 2"> Continue </v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2" :editable="!isFetching && step > 2" edit-icon="mdi-check">
        What is the URL to or identifier for the resource?
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form
          ref="form"
          v-model="isValid"
          lazy-validation
        >
          <v-text-field
            v-model.trim="url"
            :disabled="isFetching"
            :required="true"
            :rules="[v => !!v || 'required']"
            :error-messages="errorMsg"
            :placeholder="`e.g. '${selectedRepository.exampleUrl}'`"
            class="mt-4"
            label="URL*"
            type="url"
            prepend-inner-icon="mdi-link"
            persistent-hint
            outlined
          >
          </v-text-field>

          <v-btn color="primary" class="mt-4" @click="onRegisterDataset" :disabled="isFetching || !isValid"> Finish </v-btn>
        </v-form>

      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { repoMetadata } from '@/components/submit/constants'
import { IRepository } from "../submissions/types";

@Component({
  name: "cz-register-dataset",
  components: {},
})
export default class CzRegisterDataset extends Vue {
  protected url = "";
  protected step = 1
  protected selectedRepository: IRepository | null = null
  protected isFetching = false
  protected errorMsg = ''
  protected isValid = false

  protected get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata)
      .map(r => repoMetadata[r])
  }

  protected get supportedRepoMetadata() {
    return this.repoCollection.filter(r => !r.isExternal && r.isSupported)
  }

  created() {
    this.selectedRepository = this.repoCollection[0]
  }

  protected async onRegisterDataset() {
    this.isFetching = true
    this.errorMsg = ''
    try {
      console.log(this.selectedRepository, this.url)
      // await registration
      this.isFetching = false
      // redirect to submission page
    }
    catch (e) {
      this.errorMsg = 'Some error'
    }
  }
}
</script>

<style lang="scss" scoped>
.cz-register-dataset {
  // padding: 2rem;
}
</style>
