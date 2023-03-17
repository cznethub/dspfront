<template>
  <v-container id="cz-new-submission" class="cz-new-submission px-4">
    <h1 class="text-h4">{{ formTitle }}</h1>
    <v-divider class="mb-4"></v-divider>
    <v-alert
      id="instructions"
      v-if="!isLoading && wasLoaded"
      class="text-subtitle-1 my-8"
      border="left"
      colored-border
      type="info"
      elevation="2"
    >
      <div
        class="d-flex flex-wrap-wrap justify-space-between flex-column flex-md-row"
      >
        <div>
          <div><b>Instructions</b></div>
          <p>
            Fill in the required fields (marked with * and highlighted in red).
            Press the "Save / Finish" button to upload your submission.
          </p>
        </div>

        <v-img
          class="my-4 flex-grow-0 ml-md-4 ml-0"
          :src="activeRepository.get().logoSrc"
          :alt="activeRepository.get().name"
          width="350px"
          contain
        />
      </div>
    </v-alert>

    <v-alert
      v-if="!isLoading && isPublished"
      class="text-subtitle-1 my-8"
      border="left"
      colored-border
      type="warning"
      icon="mdi-pencil-off"
      elevation="2"
    >
      This resource is published and is not editable in the Data Submission
      Portal. If you need to modify this resource, navigate to the resource in
      the repository where it is hosted and modify it there (if possible). You
      can refresh the metadata for this resource by clicking the "Update Record"
      button on the My Submissions page.
    </v-alert>

    <v-alert
      class="my-8"
      outlined
      v-if="isReadOnly"
      icon="mdi-lock"
      type="warning"
      prominent
      border="left"
    >
      <div class="text-body-1">
        This submission has been submitted for review and can no longer be
        modified.
      </div>
    </v-alert>

    <cz-new-submission-actions
      id="cz-new-submission-actions-top"
      v-if="!isLoading && wasLoaded"
      :isEditMode="isEditMode"
      :isReadOnly="isReadOnly"
      :isPublished="isPublished"
      :isDevMode="isDevMode"
      :isSaving="isSaving"
      :confirmText="submitText"
      :errors="errors"
      :hasUnsavedChanges="hasUnsavedChanges"
      @show-ui-schema="onShowUISchema"
      @save-and-finish="onSaveAndFinish"
      @save="onSave"
      @cancel="goToSubmissions"
    />

    <div>
      <div v-if="!isLoading">
        <cz-folder-structure
          id="cz-folder-structure"
          v-if="!isExternal && wasLoaded"
          ref="folderStructure"
          v-model="uploads"
          @upload="uploadFiles($event)"
          :isReadOnly="isReadOnly"
          :isPublished="isPublished"
          :rootDirectory.sync="rootDirectory"
          :repoMetadata="repoMetadata[repositoryKey]"
          :isEditMode="isEditMode"
          :identifier="identifier"
        />

        <json-forms
          v-if="wasLoaded"
          :ajv="ajv"
          @change="onChange"
          :disabled="isSaving || isPublished"
          :data="data"
          :readonly="isReadOnly || isSaving || isPublished"
          :renderers="Object.freeze(renderers)"
          :schema="schema"
          :uischema="uischema"
          ref="form"
        />
      </div>

      <div v-else class="d-flex justify-center mt-8">
        <v-progress-circular
          id="progress-circular"
          indeterminate
          color="primary"
        />
      </div>

      <cz-new-submission-actions
        id="cz-new-submission-actions-bottom"
        v-if="!isLoading && wasLoaded"
        :isEditMode="isEditMode"
        :isReadOnly="isReadOnly"
        :isPublished="isPublished"
        :isDevMode="isDevMode"
        :isSaving="isSaving"
        :confirmText="submitText"
        :errors="errors"
        :hasUnsavedChanges="hasUnsavedChanges"
        @show-ui-schema="onShowUISchema"
        @save-and-finish="onSaveAndFinish"
        @save="onSave"
        @cancel="goToSubmissions"
      />
    </div>

    <v-container v-if="isLoading">
      <v-skeleton-loader type="actions, article, actions"></v-skeleton-loader>
    </v-container>

    <template v-if="!isLoading && !wasLoaded">
      <template v-if="wasUnauthorized">
        <v-alert
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
      </template>

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
              <v-btn id="orcid_login_continue" @click="onLogIn" color="primary">
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
          We could not load this submission. The service might be unavailable or
          the submission might have been deleted.
        </v-alert>

        <div class="d-flex justify-center mt-8">
          <v-icon style="font-size: 8rem" class="text--disabled"
            >mdi-database-off-outline</v-icon
          >
        </div>
      </template>
    </template>

    <v-dialog id="show-ui-schema" v-if="isDevMode" v-model="showUISchema">
      <v-card>
        <v-card-title> UI Schema </v-card-title>
        <v-card-text>
          <div class="schema-wrapper">
            <json-viewer
              :value="usedUISchema"
              :expand-depth="5"
              copyable
              expanded
              sort
            />
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showUISchema = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :value="isSaving"
      no-click-animation
      hide-overlay
      persistent
      width="300"
      attach="#cz-new-submission"
    >
      <v-card class="py-4" color="primary" dark>
        <v-card-text>
          <p id="new-submission-saving">Saving...</p>
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-overlay class="backdrop" absolute v-if="isSaving" />
  </v-container>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2";
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";
import { CzRenderers } from "@/renderers/renderer.vue";
import { EnumRepositoryKeys, IRepositoryUrls } from "../submissions/types";
import { mixins } from "vue-class-component";
import { ActiveRepositoryMixin } from "@/mixins/activeRepository.mixin";
import { repoMetadata } from "../submit/constants";
import { IFile, IFolder } from "@/components/new-submission/types";
import { ErrorObject } from "ajv";
import { Subscription } from "rxjs";
import { createAjv } from "@jsonforms/core";
import { DELETED_RESOURCE_STATUS_CODES } from "@/constants";
import JsonViewer from "vue-json-viewer";
import Repository from "@/models/repository.model";
import CzNotification from "@/models/notifications.model";
import CzFolderStructure from "@/components/new-submission/cz.folder-structure.vue";
import CzNewSubmissionActions from "@/components/new-submission/cz.new-submission-actions.vue";
import User from "@/models/user.model";
import ajvErrors from "ajv-errors";
import Submission from "@/models/submission.model";

const renderers = [
  // ...vanillaRenderers,
  ...CzRenderers,
];
const sprintf = require("sprintf-js").sprintf;
const customAjv = createAjv({ allErrors: true });
ajvErrors(customAjv);

@Component({
  name: "cz-new-submission",
  components: {
    JsonForms,
    JsonViewer,
    CzFolderStructure,
    CzNewSubmissionActions,
  },
})
export default class CzNewSubmission extends mixins<ActiveRepositoryMixin>(
  ActiveRepositoryMixin
) {
  @Ref("form") jsonForm!: typeof JsonForms;
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
  protected isSaving = false;
  protected identifier = "";
  protected data: any = {};
  protected links: any = {};
  protected renderers: JsonFormsRendererRegistryEntry[] = renderers;
  protected showUISchema = false;
  protected usedUISchema = {};
  protected repoMetadata = repoMetadata;
  protected uploads: (IFile | IFolder)[] = [];
  protected errors: ErrorObject[] = [];
  protected repositoryRecord: any = null;
  protected loggedInSubject = new Subscription();
  protected timesChanged = 0;
  protected ajv = customAjv;
  protected isReadOnly = false;
  protected wasUnauthorized = false;
  protected isPublished = false;

  protected get isEditMode() {
    return this.$route.params.id !== undefined;
  }

  protected get repositoryKey(): EnumRepositoryKeys {
    return this.$route.params.repository as EnumRepositoryKeys;
  }

  protected get schema() {
    return this.activeRepository?.get()?.schema;
  }

  protected get uischema() {
    return this.activeRepository?.get()?.uischema || undefined;
  }

  protected get schemaDefaults() {
    return this.activeRepository?.get()?.schemaDefaults;
  }

  protected get isDevMode() {
    return false;
    // TODO: uncomment when this env variable is properly setup in production
    // return process.env.NODE_ENV === "development"
  }

  protected get isExternal() {
    return this.repoMetadata[this.repositoryKey].isExternal;
  }

  protected get formTitle() {
    if (this.isExternal) {
      return "Register Dataset from External Repository";
    }
    return this.isEditMode
      ? "Edit Submission"
      : `Submit to ${this.activeRepository.get()?.name}`;
  }

  protected get submitText() {
    return this.isEditMode ? "Save Changes" : "Save";
  }

  protected get wasLoaded() {
    return this.isEditMode ? !!this.repositoryRecord : true;
  }

  protected get hasUnsavedChanges(): boolean {
    return User.$state.hasUnsavedChanges;
  }

  protected get registeringSubmission(): Partial<Submission> | null {
    return User.$state.registeringSubmission;
  }

  protected set hasUnsavedChanges(value: boolean) {
    User.commit((state) => {
      state.hasUnsavedChanges = value;
    });
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

  init() {
    this.isLoading = true;
    this.data = this.schemaDefaults;
    this.timesChanged = 0; // Need to reset in case we are redirecting from the creation page and the component wasn't destroyed
    this.hasUnsavedChanges = false;
    this.wasUnauthorized = false;

    if (
      !this.activeRepository ||
      this.activeRepository.get()?.key !== this.repositoryKey
    ) {
      // Check that the key from the url is actually a EnumRepositoryKeys
      if (EnumRepositoryKeys[this.repositoryKey]) {
        this.setActiveRepository(this.repositoryKey);
      }
    }

    if (this.isEditMode) {
      const identifier = this.$route.params.id;
      this.identifier = identifier;
      this.loadSavedSubmission();
    } else {
      this.isLoading = false;
    }
  }

  protected onLogIn() {
    User.logIn();
  }

  protected goToSubmissions() {
    this.$router.push({
      name: "submissions",
    });
  }

  protected async loadSavedSubmission() {
    console.info("CzNewSubmission: reading existing record...");
    const response =
      this.$route.query.mode === "register"
        ? this.registeringSubmission
          ? { metadata: this.registeringSubmission } // Load it from persistent state if we have it
          : await Repository.readExistingSubmission(
              this.identifier,
              this.repositoryKey
            ) // Otherwise, refetch from repository
        : await Repository.readSubmission(this.identifier, this.repositoryKey);
    if (response === 401) {
      // Repository was unauthorized
      this.wasUnauthorized = true;

      // Try again when user has authorized the repository
      this.authorizedSubject = Repository.authorized$.subscribe(
        async (repositoryKey: EnumRepositoryKeys) => {
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
      CzNotification.openDialog({
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
      if (response.published) {
        // External submissions are marked as published, but we can still edit them
        this.isPublished = this.activeRepository.entity !== EnumRepositoryKeys.external;
      }
      this.wasUnauthorized = false;
    }

    if (this.repositoryRecord) {
      Object.keys(this.repositoryRecord).map((key) => {
        if (this.repositoryRecord[key] === null) {
          this.repositoryRecord[key] = undefined;
        }
      });

      // For earthchem, check if the submission can no longer be modified
      if (this.activeRepository.entity === EnumRepositoryKeys.earthchem) {
        if (
          this.repositoryRecord.status &&
          this.repositoryRecord.status !== "incomplete"
        ) {
          this.isReadOnly = true;
        }
      }

      console.info("CzNewSubmission: reading existing files...");
      if (!this.isExternal && this.repositoryRecord) {
        try {
          const initialStructure: (IFile | IFolder)[] =
            await this.activeRepository.readRootFolder(
              this.identifier,
              "",
              this.rootDirectory
            );
          this.rootDirectory.children = initialStructure;
        } catch (e) {
          CzNotification.toast({
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

      // Nexttick doesn't work. We use setTimeout instead.
      setTimeout(() => {
        this.hasUnsavedChanges = false;
      });
    }

    // clean up
    if (this.registeringSubmission) {
      User.commit((state) => {
        state.registeringSubmission = null;
      });
    }

    this.isLoading = false;
  }

  protected onShowUISchema() {
    if (this.jsonForm) {
      this.usedUISchema = this.jsonForm.uischemaToUse;
    } else {
      this.usedUISchema = {}; // default
    }
    this.showUISchema = true;
  }

  protected onSaveAndFinish() {
    if (
      !this.isExternal &&
      (this.folderStructure?.hasInvalidFilesToUpload ||
        !this.folderStructure?.canUploadFiles)
    ) {
      CzNotification.openDialog({
        title: "Some of your files cannot be uploaded",
        content: `You have selected files for upload that are invalid or cannot be uploaded at this time. Please correct any errors indicated or confirm below to ignore them and continue.`,
        confirmText: "Continue",
        cancelText: "Cancel",
        onConfirm: async () => {
          this._onSaveAndFinish();
        },
        onCancel: () => {
          return false;
        },
      });
    } else {
      this._onSaveAndFinish();
    }
  }

  private async _onSaveAndFinish() {
    if (this.isReadOnly || this.isPublished) {
      this.$router.push({ name: "submissions" });
      return;
    }

    // In earthchem, we want to confirm if the user wants to mark the status as complete before navigating away
    if (this.activeRepository.entity === EnumRepositoryKeys.earthchem) {
      if (this.data.status === "incomplete") {
        CzNotification.openDialog({
          title: "Are you finished with this submission?",
          content: `Do you want to submit this resource for review? If so, you will not be able to make further changes.`,
          confirmText: "Submit for review",
          secondaryActionText: "Finish later",
          cancelText: "Cancel",
          onConfirm: async () => {
            this.data.status = "submitted";
            this.hasUnsavedChanges = true;
            this._saveAndFinish();
          },
          onSecondaryAction: () => {
            this._saveAndFinish();
          },
        });
      } else {
        this._saveAndFinish();
      }
    } else {
      this._saveAndFinish();
    }
  }

  protected onSave() {
    if (
      !this.isExternal &&
      (this.folderStructure?.hasInvalidFilesToUpload ||
        !this.folderStructure?.canUploadFiles)
    ) {
      CzNotification.openDialog({
        title: "Some of your files cannot be uploaded",
        content: `You have selected files for upload that are invalid or cannot be uploaded at this time. Please correct any errors indicated or confirm below to ignore them and continue.`,
        confirmText: "Continue",
        cancelText: "Cancel",
        onConfirm: async () => {
          this._onSave();
        },
        onCancel: () => {
          return false;
        },
      });
    } else {
      this._onSave();
    }
  }

  private async _onSave() {
    const wasSaved = await this._save();

    if (wasSaved) {
      this.hasUnsavedChanges = false;

      if (!this.isEditMode) {
        // If creating, redirect to the edit page
        this.$router.push({
          name: "submit.repository",
          params: {
            repository: this.activeRepository.entity,
            id: this.identifier,
          },
        });
        this.init();
      }
    }
    this.isSaving = false;
  }

  private async _saveAndFinish() {
    if (this.hasUnsavedChanges || this.$route.query.mode === "register") {
      const wasSaved = await this._save();

      if (wasSaved) {
        this.hasUnsavedChanges = false;
        this.$router.push({ name: "submissions" });
      }
    }
    // If nothing to save, just redirect to submissions page
    else {
      this.$router.push({ name: "submissions" });
    }
  }

  private async _save() {
    this.isSaving = true;
    let wasSaved = false;
    let submission;

    // If first time saving, create a new record
    if (!this.identifier) {
      console.info("CzNewSubmission: creating new record...");
      try {
        submission = await this.activeRepository?.createSubmission(
          this.data,
          this.repositoryKey
        );
      } catch (e) {
        this.isSaving = false;
        return false;
      }

      if (submission?.identifier) {
        this.identifier = submission.identifier;
        wasSaved = true;
      }
    } else {
      console.info("CzNewSubmission: Saving to existing record...");
      wasSaved = await this.activeRepository?.updateSubmission(
        this.identifier,
        this.data
      );
    }

    if (!this.isEditMode) {
      if (this.folderStructure?.canUploadFiles) {
        await this.uploadFiles(this.uploads);
      }
    }
    // If we are in edit mode, files have already been saved

    if (wasSaved) {
      // Indicate that changes have been saved
      CzNotification.toast({
        message: this.isEditMode
          ? "Your changes have been saved"
          : "Your submission has been saved!",
        type: "success",
      });
    } else {
      CzNotification.toast({
        message: this.isEditMode
          ? "Your changes could not be saved"
          : "Failed to create submission",
        type: "error",
      });
    }

    this.isSaving = false;

    return wasSaved;
  }

  protected onChange(event: JsonFormsChangeEvent) {
    // Pristine/dirty checks are currently not supported in jsonforms.
    // We use onChange event for now by ignoring the two times it is called when the form is rendered.
    // https://spectrum.chat/jsonforms/general/pristine-and-dirty-checking~2ece93ab-7783-41cb-8ba1-804414eb1da4?m=MTU2MzM0OTY0NDQxNg==

    // json-forms emits 'change' event twice during instantioation.
    const changesDuringInstantiation = 2;

    if (this.timesChanged <= 2) {
      this.timesChanged = this.timesChanged + 1;
    }

    this.hasUnsavedChanges = this.timesChanged > changesDuringInstantiation;
    this.errors = event.errors || [];
    this.data = event.data;
  }

  protected async uploadFiles(files: (IFolder | IFile)[]) {
    const repoUrls: IRepositoryUrls | undefined =
      this.activeRepository?.get()?.urls;

    if (files.length && repoUrls) {
      const url = sprintf(repoUrls.fileCreateUrl, this.identifier);

      const createFolderUrl = sprintf(
        repoUrls.folderCreateUrl,
        this.identifier,
        "%s" // replaced file by file inside repo model
      );
      files.map((f) => (f.isDisabled = true));
      await this.activeRepository?.uploadFiles(url, files, createFolderUrl);
      this.folderStructure.redrawFileTree();
    }
  }
}
</script>

<style lang="scss" scoped>
// .cz-new-submission {
// }

.schema-wrapper {
  max-width: 100%;
  height: 0;
  flex: 1;
  overflow: auto;
  border-top: 1px solid #ddd;
  min-height: 75vh;
}

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

::v-deep .v-label--active {
  transform: translateY(-26px) scale(1) !important;
  background-color: #fff;
  padding-right: 0.2rem;
}

::v-deep .horizontal-layout {
  gap: 2rem;
}

::v-deep .v-alert__content {
  width: 0;
}
</style>
