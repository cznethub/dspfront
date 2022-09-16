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
          class="pb-2"
        >
          <v-text-field
            v-model.trim="url"
            :disabled="isFetching"
            :required="true"
            :rules="[v => !!v || 'required']"
            clearable
            class="mt-4"
            label="URL or identifier*"
            type="url"
            hide-details="auto"
            persistent-hint
            outlined
          >
          </v-text-field>

          <div class="text-subtitle-1 text--secondary pl-3 mb-4 mt-1">
            {{ `e.g. '${selectedRepository.exampleUrl}' or '${selectedRepository.exampleIdentifier}'` }}
          </div>

          <v-btn color="primary" class="mr-4" @click="onReadDataset" :disabled="isFetching || !isValid || !url"> Continue </v-btn>
          <v-btn color="default" @click="step--" :disabled="isFetching" text> Back </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step :complete="step > 3" step="3" :editable="step > 3" edit-icon="mdi-check">
        Preview
      </v-stepper-step>

      <v-stepper-content step="3">
        <v-card v-if="isFetching" elevation="2" outlined>
          <div class="table-item">
            <table>
              <tr>
                <td colspan="2" class="text-h6 title">
                  <v-skeleton-loader type="heading" />
                </td>
              </tr>
            </table>
          </div>

          <div class="table-item d-flex justify-space-between flex-column flex-md-row gap-1">
            <table class="text-body-1" :class="{ 'is-xs-small': $vuetify.breakpoint.xs }">
              <tr>
                <th class="pr-4 body-2 text-right"><v-skeleton-loader type="text" /></th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
              <tr>
                <th class="pr-4 body-2 text-right"><v-skeleton-loader type="text" /></th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
              <tr>
                <th class="pr-4 body-2 text-right"><v-skeleton-loader type="text" /></th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
              <tr>
                <th class="pr-4 body-2 text-right"><v-skeleton-loader type="text" /></th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
            </table>

            <div class="text-right">
              <v-skeleton-loader type="heading" width="300" />
            </div>
          </div>
        </v-card>

        <template v-else-if="submission">
          <v-card  elevation="2" outlined class="mb-6">
            <div class="table-item d-flex justify-space-between flex-column flex-md-row">
              <table class="text-body-1" :class="{ 'is-xs-small': $vuetify.breakpoint.xs }">
                <tr>
                  <td colspan="2" class="text-h6 title">
                    {{ submission.title }}
                  </td>
                </tr>
                <tr v-if="submission.authors.length">
                  <th class="pr-4 body-2 text-right">Authors:</th>
                  <td>{{ submission.authors.join(" | ") }}</td>
                </tr>
                <tr>
                  <th class="pr-4 body-2 text-right">Submission Repository:</th>
                  <td>{{ selectedRepository.name }}</td>
                </tr>
                <tr>
                  <th class="pr-4 body-2 text-right">Submission Date:</th>
                  <td>{{ getDateInLocalTime(submission.date) }}</td>
                </tr>
                <tr>
                  <th class="pr-4 body-2 text-right">Identifier:</th>
                  <td>{{ submission.identifier }}</td>
                </tr>
                <tr v-if="submission.metadata && submission.metadata.status">
                  <th class="pr-4 body-2 text-right">Status:</th>
                  
                  <td>
                    <v-chip
                      v-if="submission.metadata.status !== 'incomplete'"
                      color="orange"
                      small
                      outlined
                    >
                      <v-icon left small>mdi-lock</v-icon>
                      {{ submission.metadata.status }}
                    </v-chip>

                    <v-chip
                      v-else
                      small
                      outlined
                    >
                      <v-icon left small>mdi-pencil</v-icon>
                      {{ submission.metadata.status }}
                    </v-chip>
                  </td>
                </tr>
              </table>

              <div class="d-flex flex-column mt-sm-4 actions">
                <v-btn :href="submission.url" target="_blank" color="blue-grey lighten-4" rounded>
                  <v-icon class="mr-1">mdi-open-in-new</v-icon> View In Repository
                </v-btn>
              </div>
            </div>
          </v-card>

          <div class="mb-2">
            <v-btn color="primary" class="mr-4" @click="goToEditSubmission" :disabled="isFetching || !isValid || !url"> Continue & Edit... </v-btn>
            <v-btn color="default" @click="step--" :disabled="isFetching" text> Back </v-btn>
          </div>
        </template>

        <template v-else-if="wasUnauthorized">
          <v-alert class="text-subtitle-1 ma-1" border="left" colored-border type="info" elevation="2">
            <v-row>
              <v-col class="flex-grow-1">We need your authorization to load this submission from the repository.</v-col>
              <v-col class="flex-grow-0">
                <v-btn @click="openAuthorizePopup(selectedRepository.key)" color="primary">
                  <i class="fas fa-key mr-2" />Authorize
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
        </template>

        <template v-else>
          <v-card elevation="2" outlined class="mb-6">
            <v-card-text class="d-flex align-center gap-1">
              <v-icon large color="orange">mdi-magnify-remove-outline</v-icon>
              <div class="text-body-1">We could not find a resource matching the criteria above. Please make sure that you have selected the correct repository and that the URL or identifier is correct and try again.</div>
            </v-card-text>
          </v-card>

          <v-btn color="default" class="mb-2" @click="step--" :disabled="isFetching" text> Back </v-btn>
        </template>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { repoMetadata } from '@/components/submit/constants'
import { EnumRepositoryKeys, IRepository } from "../submissions/types";
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
import Repository from "@/models/repository.model";
import Submission from "@/models/submission.model";
import User from "@/models/user.model";

@Component({
  name: "cz-register-dataset",
  components: {},
})
export default class CzRegisterDataset extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  protected url = ''
  protected step = 1
  protected selectedRepository: IRepository | null = null
  protected isFetching = false
  protected isValid = false
  protected submission: Partial<Submission> | null = null
  protected apiSubmission: Partial<Submission> | null = null
  protected wasUnauthorized = false

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

    return this.url
  }

  created() {
    this.selectedRepository = this.repoCollection[0]
  }

  protected async onReadDataset() {
    this.submission = null
    this.isFetching = true
    this.step++

    try {
      if (this.selectedRepository) {
        const response = await Repository.readExistingSubmission(this.identifierFromUrl, this.selectedRepository.key)

        if (response && isNaN(response)) {
          this.submission = Submission.getInsertData(response, this.selectedRepository.key, this.identifierFromUrl, true)
          this.apiSubmission = response
        }
        else if (response === 403) {
          // Repository was unauthorized
          this.wasUnauthorized = true
          
          // Try again when user has authorized the repository
          this.authorizedSubject = Repository.authorized$.subscribe(async (repositoryKey: EnumRepositoryKeys) => {
            await this.onReadDataset()
          })
        }
      }
      this.isFetching = false
    }
    catch (e) {
      console.log(e)
      this.isFetching = false
    }
  }

  protected goToEditSubmission() {
    // We cannot pass objects through routing, so we store it in ORM temporarily
    User.commit((state) => {
      state.registeringSubmission = this.apiSubmission
    })

    this.$router.push({
      name: "submit.repository",
      params: { 
        repository: (this.selectedRepository as IRepository).key,
        id: this.identifierFromUrl
      },
      query: { mode: 'register' }
    })
  }

  protected getDateInLocalTime(date: number): string {
    const offset = (new Date(date)).getTimezoneOffset() * 60 * 1000
    const localDateTime = date + offset
    return new Date(localDateTime).toLocaleString()
  }
}
</script>

<style lang="scss" scoped>
.table-item {
  padding: 1rem;

  table {
    width: 100%;

    &.is-xs-small {
      tr, td, th {
        display: block;
        text-align: left;
      }

      th {
        padding-top: 1rem;
      }
    }

    th {
      text-align: right;
      width: 11rem;
      font-weight: normal;
    }

    td {
      word-break: break-word;

      &.title {
        padding-left: 1.25rem;
        border-left: 4px solid #DDD;
      }
    }
  }
}
</style>