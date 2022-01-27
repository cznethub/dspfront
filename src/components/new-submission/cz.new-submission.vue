<template>
  <v-container class="cz-new-submission">
    <h1 class="text-h4">{{ formTitle }}</h1>
    <v-divider class="mb-4"></v-divider>
    <v-row>
      <v-col md="4" sm="12" order-md="2">
        <v-alert class="text-subtitle-1" border="left" colored-border type="info" elevation="2">
          <b>Instructions</b>: Fill in the required fields (marked with *).
          Press the "Save" button to upload your
          submission to the repository.

          <v-img
            class="my-4"
            :src="activeRepository.get().logoSrc"
            :alt="activeRepository.get().name"
            width="200px"
            contain
          />
        </v-alert>
      </v-col>

      <v-col md="8" sm="12" order-md="1">
        <div class="d-flex align-center my-4">
          <v-spacer></v-spacer>
          <div class="form-controls">
            <v-btn v-if="isDevMode" @click="onShowUISchema()" rounded
              >UI Schema</v-btn
            >
            <v-btn v-if="isEditMode" @click="goToSubmissions()" rounded
              >Cancel</v-btn
            >
            <v-btn @click="save()" color="primary" :disabled="isSaving" rounded>
              {{ isSaving ? "Saving..." : submitText }}
            </v-btn>
          </div>
        </div>

        <div>
          <div class="container">
            <div v-if="!isLoading">
              <div class="upload-drop-area has-space-bottom">
                <b-upload v-model="dropFiles" multiple drag-drop expanded>
                  <v-alert class="ma-4 has-cursor-pointer" type="info" prominent colored-border icon="mdi-file-multiple">
                    <span class="text-subtitle-1">Drop your files here or click to upload</span>
                  </v-alert>
                </b-upload>
              </div>

              <div v-if="dropFiles.length" class="mb-4">
                <transition-group name="list-files">
                  <v-chip
                    v-for="(file, index) in dropFiles"
                    :key="`${file.name}`"
                    class="list-files-item ma-1"
                    close
                    color="secondary"
                    @click:close="deleteDropFile(index)"
                  >
                    <v-icon left>mdi-file</v-icon>
                    <strong>{{ file.name }}</strong>
                  </v-chip>
                </transition-group>
              </div>

              <json-forms
                :disabled="isSaving"
                :data="data"
                :renderers="renderers"
                :schema="schema"
                :uischema="uischema"
                @change="onChange"
                ref="form"
              />
            </div>

            <v-progress-circular v-else indeterminate color="primary" />

            <!-- TODO: MOVE INTO COMPONENT AND REUSE -->
            <div
              v-if="!isLoading"
              class="form-controls has-space-top-2x text-right"
            >
              <v-btn v-if="isDevMode" @click="onShowUISchema()" rounded
                >UI Schema</v-btn
              >
              <v-btn v-if="isEditMode" @click="goToSubmissions()" rounded
                >Cancel</v-btn
              >
              <v-btn
                @click="save()"
                color="primary"
                :disabled="isSaving"
                rounded
              >
                {{ isSaving ? "Saving..." : submitText }}
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-if="isDevMode" v-model="showUISchema">
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
  </v-container>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator"
import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2"
import { vanillaRenderers } from "@jsonforms/vue2-vanilla"
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core"
import { CzRenderers } from "@/renderers/renderer.vue"
import { EnumRepositoryKeys } from "../submissions/types"
import JsonViewer from "vue-json-viewer"
import Repository from "@/models/repository.model"
import CzNotification from "@/models/notifications.model"
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'

const sprintf = require("sprintf-js").sprintf;

const renderers = [...vanillaRenderers, ...CzRenderers];

@Component({
  name: "cz-new-submission",
  components: { JsonForms, JsonViewer },
})
export default class CzNewSubmission extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  @Ref("form") jsonForm!: typeof JsonForms;
  protected isLoading = false;
  protected isSaving = false;
  protected identifier = "";
  protected data: any = {};
  protected links: any = {};
  protected renderers: JsonFormsRendererRegistryEntry[] = renderers;
  protected dropFiles: File[] = [];
  protected showUISchema = false;
  protected usedUISchema = {};

  protected get isEditMode() {
    return this.$route.params.id !== undefined;
  }

  protected get repository() {
    return this.$route.params.repository
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
    return process.env.NODE_ENV === "development";
  }

  protected get formTitle() {
    return this.isEditMode ? "Edit Submission" : `Submit to ${ this.activeRepository.name }`;
  }

  protected get submitText() {
    return this.isEditMode ? "Save Changes" : "Save";
  }

  created() {
    this.isLoading = true;
    this.data = this.schemaDefaults
    const routeRepositoryKey = this.$route.params
      .repository as EnumRepositoryKeys;

    if (
      !this.activeRepository ||
      this.activeRepository.get()?.key !== routeRepositoryKey
    ) {
      // Check that the key from the url is actually a EnumRepositoryKeys
      if (EnumRepositoryKeys[routeRepositoryKey]) {
        this.setActiveRepository(routeRepositoryKey);
      }
    }

    if (this.isEditMode) {
      const identifier = this.$route.params.id
      this.identifier = identifier
      this.loadExistingSubmission()
    } else {
      this.isLoading = false
    }
  }

  protected goToSubmissions() {
    // TODO: add discard confirm dialog if the form was changed
    this.$router.push({
      name: "submissions",
    })
  }

  protected async loadExistingSubmission() {
    console.info("CzNewSubmission: reading existing record...");
    const repositoryRecord = await Repository.readSubmission(this.identifier, this.repository)

    if (repositoryRecord) {
      this.data = {
        ...this.data,
        ...repositoryRecord,
      };
      // this.links = repositoryRecord?.formMetadata.links // Has useful links, i.e: bucket for upload
    }
    else {
      // TODO: indicate in the UI that submission was not loaded
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

  protected async save() {
    this.isSaving = true

    let submission

    // If first time saving, create a new record
    if (!this.identifier) {
      console.info("CzNewSubmission: creating new record...")
      try {
        submission = await this.activeRepository?.createSubmission(this.data, this.repository)
      } catch (e) {
        this.isSaving = false
        return;
      }

      if (submission?.recordId) {
        // this.data = {
        //   ...this.data,
        //   ...submission?.formMetadata.metadata,
        // };
        // this.links = submission?.formMetadata.links; // Has useful links, i.e: bucket for upload
        this.identifier = submission.recordId
      }
    } else {
      console.info("CzNewSubmission: Saving to existing record...");
      await this.activeRepository?.updateSubmission(
        this.identifier,
        this.data
      )
    }

    // If files have been selected for upload, upload them
    if (this.dropFiles.length) {
      const url = sprintf(
        this.activeRepository?.get()?.urls?.fileCreateUrl,
        this.identifier
      )
      await this.activeRepository?.uploadFiles(url, this.dropFiles)
    }

    // Indicate that changes have been saved
    CzNotification.toast({
      message: this.isEditMode
        ? "Your changes have been saved"
        : "Your submission has been saved!",
    })
    this.$router.push({ name: "submissions" })
  }

  protected deleteDropFile(index) {
    this.dropFiles.splice(index, 1);
  }

  protected onChange(event: JsonFormsChangeEvent) {
    this.data = event.data
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

.upload-drop-area {
  border: 1px dashed #ddd;
  border-radius: 0.5rem;
  cursor: pointer;

  ::v-deep input[type="file"] {
    display: none;
  }
}

.list-files-item {
  transition: all 0.55s ease;
  display: inline-block;
}

.list-files-enter,
.list-files-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-files-leave-active {
  position: absolute;
}

.form-controls {
  button + button {
    margin-left: 1rem;
  }
}
</style>
