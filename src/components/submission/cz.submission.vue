<template>
  <div class="cz-submission">
    <h1 >Submission</h1>
    <hr>
    <div v-if="submission">
      <div class=" actions">
        <v-btn  @click="onDelete" :disabled="isDeleting"><v-icon>delete</v-icon> {{ isDeleting ? 'Deleting...' : 'Delete' }}</v-btn>
        <v-btn  @click="$emit('edit', submission)"><v-icon>edit</v-icon> Edit</v-btn>
        <v-btn ><v-icon>open_in_new</v-icon> View In Repository</v-btn>
      </div>

      <b>Title: </b> <span class="ing">{{ submission.title }}</span>
      <p class="has-text-left"><b>Authors: </b>{{ submission.authors.join(', ')}}</p>
      <p class="has-text-left"><b>Submission Repository: </b>{{ repoMetadata[submission.repository].name }}</p>
      <p class="has-text-left"><b>Submission Date: </b>{{ new Date(submission.date).toLocaleString() }}</p>
      <p class="has-text-left"><b>Identifier: </b>{{ submission.identifier }}</p>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator'
  import { repoMetadata } from '../submit/constants'
  import { EnumRepositoryKeys } from '@/components/submissions/types'
  import Submission from '@/models/submission.model'
  import CzNotification from '@/models/notifications.model'
  import Repository from '@/models/repository.model'
  import HydroShare from '@/models/hydroshare.model'
  import Zenodo from '@/models/zenodo.model'

  @Component({
    name: 'cz-submission',
    components: { },
  })
  export default class CzSubmission extends Vue {
    @Prop({ required: true }) identifier!: string
    protected repoMetadata = repoMetadata
    protected isDeleting = false

    protected get submission() {
      return Submission.find([this.identifier.toString(), this.activeRepository.entity])
    }

    // TODO: add to a mixin and reuse
    protected get activeRepository() {
      const key = Repository.$state.submittingTo
      switch (key) {
        case EnumRepositoryKeys.hydroshare: return HydroShare
        case EnumRepositoryKeys.zenodo: return Zenodo
        default: return Zenodo
      }
    }

    protected onDelete() {
      CzNotification.openDialog({
        title: 'Delete this submission?',
        content: 'Are you sure you want to delete this submission?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: async () => {
          this.isDeleting = true
          await this.activeRepository.deleteRecord(this.identifier)
          this.isDeleting = false
        }
      })
    }
  }
</script>

<style lang="scss" scoped>
  // .cz-submission {
  // }

  .actions {
    gap: 1rem;
  }
</style>
