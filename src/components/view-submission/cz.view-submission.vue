<template>
  <v-container id="cz-view-submission" class="cz-view-submission px-4">
    <h1 class="text-h4">View Submission</h1>
    <v-divider class="mb-4"></v-divider>
    <template v-if="isLoading">
      <div class="d-flex justify-center mt-8">
        <v-progress-circular
          id="progress-circular"
          indeterminate
          color="primary"
        />
      </div>

      <v-container>
        <v-skeleton-loader type="actions, article, actions"></v-skeleton-loader>
      </v-container>
    </template>
    <template v-else>
      <v-alert
        v-if="isPublished"
        class="my-8"
        outlined
        icon="mdi-lock"
        type="info"
        prominent
        border="left"
      >
        <div
          class="d-flex flex-wrap-wrap justify-space-between align-center flex-column flex-md-row"
        >
          <p class="ma-0">
            This resource is published and is not editable in the Data
            Submission Portal. If you need to modify this resource, navigate to
            the resource in the repository where it is hosted and modify it
            there (if possible). You can refresh the metadata for this resource
            by clicking the "Update Record" button on the My Submissions page.
          </p>

          <v-img
            class="my-4 flex-grow-0 ml-md-4 ml-0"
            :src="activeRepository.get()?.logoSrc"
            :alt="activeRepository.get()?.name"
            width="350px"
            contain
          />
        </div>
      </v-alert>

      <v-alert
        v-if="isEclSubmitted"
        class="my-8"
        outlined
        icon="mdi-lock"
        type="info"
        prominent
        border="left"
      >
        <div
          class="d-flex flex-wrap-wrap justify-space-between align-center flex-column flex-md-row"
        >
          <p class="ma-0">
            This submission has been submitted for review and can not be
            modified at this time.
          </p>

          <v-img
            class="my-4 flex-grow-0 ml-md-4 ml-0"
            :src="activeRepository.get()?.logoSrc"
            :alt="activeRepository.get()?.name"
            width="350px"
            contain
          />
        </div>
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
        <div
          class="d-flex flex-wrap-wrap justify-space-between align-center flex-column flex-md-row"
        >
          <p class="ma-0">
            This resource is a HydroShare Collection and is not editable in the
            Data Submission Portal. If you need to modify this resource once
            registered, navigate to the resource in the repository where it is
            hosted and modify it there (if possible). You can refresh the
            metadata for this resource by clicking the "Update Record" button on
            the My Submissions page.
          </p>

          <v-img
            class="my-4 flex-grow-0 ml-md-4 ml-0"
            :src="activeRepository.get()?.logoSrc"
            :alt="activeRepository.get()?.name"
            width="350px"
            contain
          />
        </div>
      </v-alert>

      <div class="d-flex gap-1 mt-4 mb-8">
        <v-spacer></v-spacer>
        <v-btn
          @click="goToSubmissions"
          rounded
          class="submission-cancel my-2 my-sm-0"
          >Back</v-btn
        >
        <v-btn
          v-if="!(isHsCollection || isPublished)"
          @click="goToEditSubmission"
          rounded
        >
          <v-icon class="mr-1">mdi-pencil-outline</v-icon> Edit
        </v-btn>
        <v-btn
          v-if="repositoryUrl"
          :href="repositoryUrl"
          target="_blank"
          color="blue-grey lighten-4"
          rounded
        >
          <v-icon class="mr-1">mdi-open-in-new</v-icon> View In Repository
        </v-btn>
      </div>

      <cz-folder-structure
        v-if="hasFolderStructure"
        v-model="uploads"
        id="cz-folder-structure"
        ref="folderStructure"
        :isReadOnly="true"
        :allowFileUpload="false"
        :rootDirectory.sync="rootDirectory"
        :repoMetadata="repoMetadata[repositoryKey]"
        :isEditMode="false"
        :identifier="identifier"
      />

      <template v-if="wasLoaded">
        <cz-form
          :schema="schema"
          :uischema="uiSchema"
          :data.sync="data"
          :config="config"
          ref="form"
        />
      </template>
      <template v-else>
        <v-alert
          v-if="wasUnauthorized"
          class="text-subtitle-1"
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
                @click="openAuthorizePopup(repositoryKey)"
                color="primary"
                class="mb-4"
              >
                <i class="fas fa-key mr-2" />Authorize
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <template v-else-if="!isLoggedIn">
          <v-alert
            class="text-subtitle-1"
            border="left"
            colored-border
            type="info"
            elevation="2"
          >
            <v-row>
              <v-col class="flex-grow-1"
                >You need to log in to access this submission.</v-col
              >
              <v-col class="flex-grow-0">
                <v-btn
                  id="orcid_login_continue"
                  @click="onLogIn"
                  color="primary"
                >
                  <v-icon class="mr-2">fab fa-orcid</v-icon>
                  <span>Log In Using ORCID</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>

          <div class="d-flex justify-center mt-8">
            <v-icon style="font-size: 8rem" class="text--disabled"
              >mdi-login</v-icon
            >
          </div>
        </template>

        <template v-else>
          <v-alert
            class="text-subtitle-1"
            border="left"
            colored-border
            type="error"
            elevation="2"
          >
            We could not load this submission. The service might be unavailable
            or the submission might have been deleted.
          </v-alert>

          <div class="d-flex justify-center mt-8">
            <v-icon style="font-size: 8rem" class="text--disabled"
              >mdi-database-off-outline</v-icon
            >
          </div>
        </template>
      </template>

      <div class="d-flex gap-1 my-4">
        <v-spacer></v-spacer>
        <v-btn
          @click="goToSubmissions"
          rounded
          class="submission-cancel my-2 my-sm-0"
          >Back</v-btn
        >
        <v-btn
          v-if="!(isHsCollection || isPublished)"
          @click="goToEditSubmission"
          rounded
        >
          <v-icon class="mr-1">mdi-pencil-outline</v-icon> Edit
        </v-btn>
        <v-btn
          v-if="repositoryUrl"
          :href="repositoryUrl"
          target="_blank"
          color="blue-grey lighten-4"
          rounded
        >
          <v-icon class="mr-1">mdi-open-in-new</v-icon> View In Repository
        </v-btn>
      </div>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { EnumRepositoryKeys } from "../submissions/types";
import { mixins } from "vue-class-component";
import { ActiveRepositoryMixin } from "@/mixins/activeRepository.mixin";
import { repoMetadata } from "../submit/constants";
import { IFile, IFolder } from "@/components/new-submission/types";
import { Subscription } from "rxjs";
import { Notifications, CzForm } from "@cznethub/cznet-vue-core";
import { DELETED_RESOURCE_STATUS_CODES } from "@/constants";
import Repository from "@/models/repository.model";
import CzFolderStructure from "@/components/new-submission/cz.folder-structure.vue";
import User from "@/models/user.model";
import Submission from "@/models/submission.model";

const initialData = {};

@Component({
  name: "cz-view-submission",
  components: {
    CzFolderStructure,
    CzForm,
  },
})
export default class CzViewSubmission extends mixins<ActiveRepositoryMixin>(
  ActiveRepositoryMixin
) {
  @Ref("folderStructure") folderStructure!: InstanceType<
    typeof CzFolderStructure
  >;

  protected rootDirectory: IFolder = {
    name: "root",
    children: [],
    parent: null,
    key: "",
    path: "",
  };
  protected isLoading = false;
  protected isLoadingInitialFiles = false;
  protected data: any = initialData;
  protected usedUISchema = {};
  protected repoMetadata = repoMetadata;
  protected uploads: (IFile | IFolder)[] = [];
  protected repositoryRecord: any = null;
  protected loggedInSubject = new Subscription();
  protected wasUnauthorized = false;
  protected identifier = "";
  protected repositoryKey: EnumRepositoryKeys = EnumRepositoryKeys.external;

  protected get config() {
    return {
      restrict: true,
      trim: false,
      showUnfocusedDescription: false,
      hideRequiredAsterisk: false,
      collapseNewItems: false,
      breakHorizontal: false,
      initCollapsed: false,
      hideAvatar: false,
      hideArraySummaryValidation: false,
      vuetify: {
        commonAttrs: {
          dense: true,
          outlined: true,
          "persistent-hint": true,
          "hide-details": false,
        },
      },
      // isViewMode: true,
      isReadOnly: true,
      // isDisabled: false,
    };
  }

  protected get dbSubmission() {
    const submission = Submission.find([
      this.identifier,
      this.activeRepository.entity,
    ]);
    return submission;
  }

  protected get isHsCollection(): boolean {
    return this.dbSubmission?.metadata.type === "CollectionResource";
  }

  protected get isEclSubmitted(): boolean {
    return (
      this.activeRepository.entity === EnumRepositoryKeys.earthchem &&
      this.dbSubmission?.metadata.status === "submitted"
    );
  }

  protected get isPublished(): boolean {
    if (this.activeRepository.entity === EnumRepositoryKeys.hydroshare) {
      return !!this.dbSubmission?.metadata.published;
    } else if (this.activeRepository.entity === EnumRepositoryKeys.earthchem) {
      return this.dbSubmission?.metadata.status === "published";
    }

    return false;
  }

  protected get repositoryUrl() {
    return this.dbSubmission?.url;
  }

  protected get hasFolderStructure() {
    return this.wasLoaded && !this.isExternal && !this.isHsCollection;
  }

  protected get schema() {
    return this.activeRepository?.get()?.schema;
  }

  protected get uiSchema() {
    return this.activeRepository?.get()?.uischema || undefined;
  }

  protected get schemaDefaults() {
    return this.activeRepository?.get()?.schemaDefaults;
  }

  protected get isDevMode() {
    // TODO: uncomment when this env variable is properly setup in production
    // return process.env.NODE_ENV === "development"
    return false;
  }

  protected get isExternal() {
    return this.repoMetadata[this.repositoryKey].isExternal;
  }

  protected get wasLoaded() {
    return !!this.repositoryRecord;
  }

  protected get isLoggedIn() {
    return User.$state.isLoggedIn;
  }

  created() {
    this.init();
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe();
  }

  async init() {
    this.isLoading = true;
    this.data = this.schemaDefaults;
    this.repositoryKey = this.$route.params.repository as EnumRepositoryKeys;
    this.identifier = this.$route.params.id;

    if (
      !this.activeRepository ||
      this.activeRepository.get()?.key !== this.repositoryKey
    ) {
      // Check that the key from the url is actually an EnumRepositoryKeys
      if (EnumRepositoryKeys[this.repositoryKey]) {
        this.setActiveRepository(this.repositoryKey);
      }
    }

    await this.loadSavedSubmission();
    this.isLoading = false;
  }

  protected onLogIn() {
    User.logIn();
  }

  protected goToEditSubmission() {
    this.$router.push({
      name: "submit.repository",
      params: { repository: this.repositoryKey, id: this.identifier },
    });
  }

  protected goToSubmissions() {
    this.$router.push({
      name: "submissions",
    });
  }

  protected async loadSavedSubmission() {
    console.info("CzViewSubmission: reading existing record...");
    const response = await Repository.readSubmission(
      this.identifier,
      this.repositoryKey
    );
    if (response === 401) {
      // Repository was unauthorized
      this.wasUnauthorized = true;

      // Try again when user has authorized the repository
      this.authorizedSubject = Repository.authorized$.subscribe(
        async (_repositoryKey: EnumRepositoryKeys) => {
          this.isLoading = true;
          await this.loadSavedSubmission();
        }
      );
    } else if (response === 403) {
      // Submission not found or service unavailable
      this.repositoryRecord = null;

      if (!this.isLoggedIn) {
        this.loggedInSubject = User.loggedIn$.subscribe(async () => {
          this.isLoading = true;
          await this.loadSavedSubmission();
        });
      }
    } else if (DELETED_RESOURCE_STATUS_CODES.includes(response)) {
      // Resource has been deleted in repository
      this.repositoryRecord = null;
      Notifications.openDialog({
        title: "This resource has been deleted",
        content:
          "The resource you requested does not exist in the remote repository. It may have been deleted outside of the Data Submission Portal. Do you want to remove it from your list of submissions?",
        confirmText: "Remove",
        cancelText: "Cancel",
        onConfirm: async () => {
          await Repository.deleteSubmission(
            this.identifier,
            this.repositoryKey
          );
          this.$router.push({ name: "submissions" });
        },
      });
    } else {
      this.repositoryRecord = response.metadata;
      this.wasUnauthorized = false;
    }

    if (this.repositoryRecord) {
      Object.keys(this.repositoryRecord).map((key) => {
        if (this.repositoryRecord[key] === null) {
          this.repositoryRecord[key] = undefined;
        }
      });

      if (this.hasFolderStructure) {
        console.info("CzViewSubmission: reading existing files...");
        try {
          const initialStructure: (IFile | IFolder)[] =
            await this.activeRepository.readRootFolder(
              this.identifier,
              "",
              this.rootDirectory
            );
          this.rootDirectory.children = initialStructure;
        } catch (e) {
          Notifications.toast({
            message: "Failed to load existing files.",
            type: "error",
          });
        }
      }
      this.isLoadingInitialFiles = false;

      this.data = {
        ...this.data,
        ...this.repositoryRecord,
      };
    }

    this.isLoading = false;
  }
}
</script>

<style lang="scss" scoped>
.form-controls {
  button + button {
    margin-left: 1rem;
  }
}

#instructions .d-flex {
  align-items: center;
}

::v-deep .v-overlay.backdrop {
  z-index: 4 !important;
}

::v-deep .v-alert__content {
  width: 0;
}
</style>
