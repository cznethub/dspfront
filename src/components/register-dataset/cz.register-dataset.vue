<template>
  <v-container class="cz-register-dataset">
    <div class="text-h4">Register Dataset</div>
    <v-divider class="mb-2" />

    <v-alert
      class="mt-2"
      border="left"
      colored-border
      type="info"
      elevation="1"
    >
      You should only use this form to register existing datasets from
      HydroShare, EarthChem, or Zenodo that were not submitted through the Data
      Submission Portal
    </v-alert>

    <v-stepper v-model="step" vertical flat>
      <v-stepper-step
        :complete="step > 1"
        step="1"
        :editable="!isFetching && step > 1"
        edit-icon="mdi-check"
      >
        <div>What repository is the resource in?</div>
        <v-chip
          v-if="selectedRepository && step > 1"
          class="mt-2"
          color="success"
          >{{ selectedRepository.name }}</v-chip
        >
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-radio-group v-model="selectedRepository">
          <v-radio
            v-for="repo of supportedRepoMetadata"
            :key="repo.key"
            :value="repo"
            :label="repo.name"
          >
          </v-radio>
        </v-radio-group>

        <v-btn color="primary" @click="step = 2"> Continue </v-btn>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 2"
        step="2"
        :editable="!isFetching && step > 2"
        edit-icon="mdi-check"
      >
        <div>What is the URL to or identifier for the resource?</div>
        <v-chip v-if="url && step > 2" class="mt-2" color="success">{{
          url
        }}</v-chip>
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-form
          ref="form"
          v-model="isValid"
          lazy-validation
          class="pb-2"
          @submit.prevent
        >
          <v-text-field
            v-model.trim="url"
            ref="txtIdentifier"
            :disabled="isFetching"
            :required="true"
            :rules="[isValidUrlOrIdentifier()]"
            clearable
            class="mt-4"
            label="URL or identifier*"
            type="url"
            hide-details="auto"
            persistent-hint
            outlined
            @keypress.enter="onReadDataset"
          >
          </v-text-field>

          <div class="text-subtitle-1 text--secondary pl-3 mb-4 mt-1">
            {{
              `e.g. '${selectedRepository.exampleUrl}' or '${selectedRepository.exampleIdentifier}'`
            }}
          </div>

          <v-btn
            color="primary"
            class="mr-4"
            @click="onReadDataset"
            :disabled="!canReadDataset"
          >
            Continue
          </v-btn>
          <v-btn color="default" @click="step--" :disabled="isFetching" text>
            Back
          </v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 3"
        step="3"
        :editable="step > 3"
        edit-icon="mdi-check"
      >
        Preview
      </v-stepper-step>

      <v-stepper-content step="3">
        <v-card v-if="isFetching" elevation="2" outlined>
          <div class="table-item">
            <table
              class="text-body-1"
              :class="{ 'is-xs-small': $vuetify.breakpoint.xs }"
            >
              <tr>
                <td colspan="2" class="text-h6 title">
                  <v-skeleton-loader type="heading" />
                </td>
              </tr>
            </table>
          </div>

          <div
            class="table-item d-flex justify-space-between flex-column flex-md-row gap-1"
          >
            <table
              class="text-body-1"
              :class="{ 'is-xs-small': $vuetify.breakpoint.xs }"
            >
              <tr>
                <th class="pr-4 body-2 text-right">
                  <v-skeleton-loader type="text" />
                </th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
              <tr>
                <th class="pr-4 body-2 text-right">
                  <v-skeleton-loader type="text" />
                </th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
              <tr>
                <th class="pr-4 body-2 text-right">
                  <v-skeleton-loader type="text" />
                </th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
              <tr>
                <th class="pr-4 body-2 text-right">
                  <v-skeleton-loader type="text" />
                </th>
                <td><v-skeleton-loader type="text" /></td>
              </tr>
            </table>

            <div class="text-right">
              <v-skeleton-loader type="heading" width="300" />
            </div>
          </div>
        </v-card>

        <template v-else-if="submission">
          <v-alert
            v-if="isPublished"
            class="my-8"
            outlined
            icon="mdi-lock"
            type="info"
            prominent
            border="left"
          >
            This resource is published and is not editable in the Data
            Submission Portal. If you need to modify this resource once
            registered, navigate to the resource in the repository where it is
            hosted and modify it there (if possible). You can refresh the
            metadata for this resource by clicking the "Update Record" button on
            the My Submissions page.
          </v-alert>

          <v-alert
            v-if="isHsCollection"
            class="my-8"
            outlined
            icon="mdi-lock"
            type="info"
            prominent
            border="left"
          >
            This resource is a HydroShare Collection and is not editable in the
            {{ $t("portalName") }}. If you need to modify this resource once
            registered, navigate to the resource in the repository where it is
            hosted and modify it there (if possible). You can refresh the
            metadata for this resource by clicking the "Update Record" button on
            the My Submissions page.
          </v-alert>

          <v-card elevation="2" outlined class="mb-6">
            <div
              class="table-item d-flex justify-space-between flex-column flex-md-row"
            >
              <table
                class="text-body-1"
                :class="{ 'is-xs-small': $vuetify.breakpoint.xs }"
              >
                <tr>
                  <td colspan="2" class="text-h6 title">
                    {{ submission.title }}
                  </td>
                </tr>
                <tr v-if="submission.authors && submission.authors.length">
                  <th class="pr-4 body-2">Authors:</th>
                  <td>{{ submission.authors.join(" | ") }}</td>
                </tr>
                <tr>
                  <th class="pr-4 body-2">Submission Repository:</th>
                  <td>{{ selectedRepository.name }}</td>
                </tr>
                <tr>
                  <th class="pr-4 body-2">Submission Date:</th>
                  <td>{{ getDateInLocalTime(submission.date) }}</td>
                </tr>
                <tr>
                  <th class="pr-4 body-2">Identifier:</th>
                  <td>{{ submission.identifier }}</td>
                </tr>
                <tr v-if="selectedRepository.name == 'HydroShare'">
                  <th class="pr-4 body-2">Type:</th>
                  <td>{{ resourceType }}</td>
                </tr>
                <tr v-if="submission.metadata && submission.metadata.status">
                  <th class="pr-4 body-2">Status:</th>

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

                    <v-chip v-else small outlined>
                      <v-icon left small>mdi-pencil</v-icon>
                      {{ submission.metadata.status }}
                    </v-chip>
                  </td>
                </tr>
              </table>

              <div class="d-flex flex-column mt-4 mt-md-0 actions">
                <v-btn
                  :href="submission.url"
                  target="_blank"
                  color="blue-grey lighten-4"
                  rounded
                >
                  <v-icon class="mr-1">mdi-open-in-new</v-icon> View In
                  Repository
                </v-btn>
              </div>
            </div>
          </v-card>

          <div class="mb-2">
            <v-btn
              v-if="isPublished || isHsCollection"
              color="primary"
              class="mr-4"
              @click="registerSubmissionAsIs"
              :disabled="isFetching || !isValid || !url || isRegistering"
            >
              {{ isRegistering ? "Registering..." : "Register Dataset" }}
            </v-btn>

            <v-btn
              v-else
              color="primary"
              class="mr-4"
              @click="goToEditSubmission"
              :disabled="isFetching || !isValid || !url"
            >
              Continue & Edit...
            </v-btn>

            <v-btn color="default" @click="step--" :disabled="isFetching" text>
              Back
            </v-btn>
          </div>
        </template>

        <template v-else-if="wasUnauthorized">
          <v-alert
            class="text-subtitle-1 ma-1"
            border="left"
            colored-border
            type="info"
            elevation="2"
          >
            <v-row>
              <v-col class="flex-grow-1"
                >We need your authorization to load this submission from the
                repository.</v-col
              >
              <v-col class="flex-grow-0">
                <v-btn
                  @click="openAuthorizePopup(selectedRepository.key)"
                  color="primary"
                >
                  <i class="fas fa-key mr-2" />Authorize
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
        </template>

        <template v-else>
          <v-alert
            class="text-subtitle-1 ma-2"
            border="left"
            colored-border
            type="warning"
            elevation="2"
            icon="mdi-magnify-remove-outline"
          >
            We could not find a resource matching the criteria above. Please
            make sure that you have selected the correct repository and that the
            URL or identifier is correct and try again.
          </v-alert>

          <v-btn
            color="default"
            class="mb-2"
            @click="step--"
            :disabled="isFetching"
            text
          >
            Back
          </v-btn>
        </template>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import { repoMetadata } from "@/components/submit/constants";
import { EnumRepositoryKeys, IRepository } from "../submissions/types";
import { mixins } from "vue-class-component";
import { ActiveRepositoryMixin } from "@/mixins/activeRepository.mixin";
import { Notifications } from "@cznethub/cznet-vue-core";
import Repository from "@/models/repository.model";
import Submission from "@/models/submission.model";
import User from "@/models/user.model";

@Component({
  name: "cz-register-dataset",
  components: {},
})
export default class CzRegisterDataset extends mixins<ActiveRepositoryMixin>(
  ActiveRepositoryMixin
) {
  protected url = "";
  protected step = 1;
  protected selectedRepository: IRepository | null = null;
  protected isFetching = false;
  protected isValid = false;
  protected submission: Partial<Submission> | null = null;
  protected apiSubmission: any = null;
  protected wasUnauthorized = false;
  protected isPublished = false;
  protected isRegistering = false;
  protected allowFileUpload = true;
  protected resourceType = "";
  protected isHsCollection = false;

  protected get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata).map((r) => repoMetadata[r]);
  }

  protected get supportedRepoMetadata() {
    return this.repoCollection.filter((r) => !r.isExternal && r.isSupported);
  }

  protected get canReadDataset(): boolean {
    return !this.isFetching && this.isValid && !!this.url;
  }

  protected get identifierFromUrl(): string {
    if (this.selectedRepository?.identifierPattern?.test(this.url)) {
      return this.url;
    } else if (this.selectedRepository?.identifierUrlPattern?.test(this.url)) {
      const matches = this.selectedRepository?.identifierUrlPattern?.exec(
        this.url
      );

      if (matches && matches.length) {
        return matches[1];
      }
    }

    return this.url; // default
  }

  @Watch("step")
  onStepChange(currentStep, previousStep) {
    if (currentStep === 2) {
      // @ts-ignore
      this.$refs.txtIdentifier?.focus();
    }
  }

  created() {
    this.selectedRepository = this.repoCollection[0];
  }

  protected onReadDataset() {
    if (this.canReadDataset) {
      this.step++;
      this._readDataset();
    }
  }

  protected goToEditSubmission() {
    // We cannot pass objects through routing, so we store it in ORM temporarily
    User.commit((state) => {
      state.registeringSubmission = this.apiSubmission;
    });

    this.$router.push({
      name: "submit.repository",
      params: {
        repository: (this.selectedRepository as IRepository).key,
        id: this.identifierFromUrl,
      },
      query: { mode: "register" },
    });
  }

  /** We register published submissions as they are because they can no longer be edited */
  protected async registerSubmissionAsIs() {
    this.isRegistering = true;
    try {
      await Repository.readSubmission(
        this.identifierFromUrl,
        (this.selectedRepository as IRepository).key
      );

      this.isRegistering = false;
      Notifications.toast({
        message: "Your dataset has been registered!",
        type: "success",
      });
      this.$router.push({
        name: "submissions",
      });
    } catch (e) {
      this.isRegistering = false;
      Notifications.toast({
        message: "Failed to register dataset",
        type: "error",
      });
    }
  }

  protected getDateInLocalTime(date: number): string {
    const offset = new Date(date).getTimezoneOffset() * 60 * 1000;
    const localDateTime = date + offset;
    return new Date(localDateTime).toLocaleString();
  }

  protected isValidUrlOrIdentifier(): true | string {
    if (!this.url) {
      return "required";
    }

    return this.selectedRepository?.identifierPattern?.test(this.url) ||
      this.selectedRepository?.identifierUrlPattern?.test(this.url)
      ? true
      : "invalid URL or Identifier";
  }

  private async _readDataset() {
    this.submission = null;
    this.isFetching = true;
    this.wasUnauthorized = false;
    this.isPublished = false;
    this.isHsCollection = false;
    this.allowFileUpload = true;
    this.resourceType = "";

    try {
      if (this.selectedRepository) {
        const response = await Repository.readExistingSubmission(
          this.identifierFromUrl,
          this.selectedRepository.key
        );

        if (response && isNaN(response)) {
          this.submission = Submission.getInsertData(
            response.metadata,
            this.selectedRepository.key,
            this.identifierFromUrl,
            true
          );
          this.apiSubmission = response.metadata;
          if (response.published) {
            this.isPublished = true;
          }

          // For earthchem submissions we need to set the community to a constant
          if (this.submission.repository === EnumRepositoryKeys.earthchem) {
            this.apiSubmission.community = this.$t("footer.orgName");
          }
          if (this.submission.repository === EnumRepositoryKeys.hydroshare) {
            if (response.metadata.type === "CollectionResource") {
              this.isHsCollection = true;
            }

            this.allowFileUpload =
              this.apiSubmission.type === "CompositeResource" &&
              !this.isPublished;
            this.resourceType =
              this.apiSubmission.type === "CompositeResource"
                ? "Resource"
                : "Collection";
          } else {
            this.allowFileUpload = !this.isPublished;
          }
        }
        // Repository was unauthorized
        else if (response === 401) {
          this.wasUnauthorized = true;

          // Try again when user has authorized the repository
          this.authorizedSubject = Repository.authorized$.subscribe(
            async (_repositoryKey: EnumRepositoryKeys) => {
              await this._readDataset();
            }
          );
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.isFetching = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.table-item {
  padding: 1rem;

  table {
    width: 100%;

    &.is-xs-small {
      tr,
      td,
      th {
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
        border-left: 4px solid #ddd;
      }
    }
  }
}
</style>
