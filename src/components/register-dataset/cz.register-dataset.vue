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
        <div>What is the URL to or identifier for the resource?</div>
        <v-chip v-if="url && step > 2" class="mt-2" color="success">{{ url }}</v-chip>
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
            placeholder="URL or identifier"
            class="mt-4"
            label="URL*"
            type="url"
            prepend-inner-icon="mdi-link"
            persistent-hint
            outlined
          >
          </v-text-field>

          <div class="text-subtitle-1 text--secondary pl-3">
            {{ `e.g. '${selectedRepository.exampleUrl}' or '${selectedRepository.exampleIdentifier}'` }}
          </div>

          <v-btn color="primary" class="mt-4" @click="onReadDataset" :disabled="isFetching || !isValid || !url"> Continue </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step :complete="step > 3" step="3" :editable="step > 3" edit-icon="mdi-check">
        Confirm
      </v-stepper-step>

      <v-stepper-content step="3">
        <div v-if="isFetching">Loading...</div>
        <div v-if="submission">
          {{ submission.title }}
        </div>
        <v-btn color="primary" class="mt-4" @click="goToEditSubmission" :disabled="isFetching || !isValid || !url"> Continue </v-btn>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { repoMetadata } from '@/components/submit/constants'
import { IRepository } from "../submissions/types";
import Repository from "@/models/repository.model";

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
  protected submission: any = null

  protected get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata)
      .map(r => repoMetadata[r])
  }

  protected get supportedRepoMetadata() {
    return this.repoCollection.filter(r => !r.isExternal && r.isSupported)
  }

  protected get identifierFromUrl(): string {
    const matches = this.selectedRepository?.identifierUrlPattern?.exec(this.url)

    if (matches && matches.length) {
      return matches[0]
    }

    return ''
  }

  created() {
    this.selectedRepository = this.repoCollection[0]
  }

  protected async onReadDataset() {
    this.isFetching = true
    this.errorMsg = ''
    this.step++
    try {
      if (this.selectedRepository) {
        const response = await Repository.readExistingSubmission(this.identifierFromUrl, this.selectedRepository.key)
          console.log(response)
        if (response) {
          this.submission = response
        }
      }
      // await registration
      this.isFetching = false
      // redirect to submission page
    }
    catch (e) {
      this.errorMsg = 'Some error'
      this.isFetching = false
    }
  }

  protected goToEditSubmission() {
    // TODO: pass data and param
    this.$router.push({
      name: "submit.repository",
      params: { 
        repository: (this.selectedRepository as IRepository).key,
        id: this.identifierFromUrl 
      },
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
