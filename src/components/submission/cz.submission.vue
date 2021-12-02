<template>
  <div class="cz-submission">
    <h1 class="md-display-1">Submission</h1>
    <hr>
    <div v-if="submission">
      <div>
        <md-button class="md-raised md-accent" expanded size="is-medium" type="is-primary">View Record In Repository</md-button>
      </div>

      <b>Title: </b> <span class="md-subheading">{{ submission.title }}</span>
      <p class="has-text-left"><b>Authors: </b>{{ submission.authors.join(', ')}}</p>
      <p class="has-text-left"><b>Submission Repository: </b>{{ repoMetadata[submission.repository].name }}</p>
      <p class="has-text-left"><b>Submission Date: </b>{{ submission.date.toLocaleDateString() }}</p>
      <p class="has-text-left"><b>Status: </b>{{ enumSubmissionStatus[submission.status] }}</p>
      <p class="has-text-left"><b>Identifier: </b>{{ submission.identifier }}</p>
    </div>
  </div>
</template>

<script lang="ts">
  import Submission from '@/models/submission.model'
  import { Component, Vue, Prop } from 'vue-property-decorator'
  import { repoMetadata } from '../submit/constants'
  import { EnumSubmissionStatus } from '@/components/submissions/types'

  @Component({
    name: 'cz-submission',
    components: { },
  })
  export default class CzSubmission extends Vue {
    @Prop({ required: true }) submissionId!: number
    protected enumSubmissionStatus = EnumSubmissionStatus
    protected repoMetadata = repoMetadata

    protected get submission() {
      return Submission.find(this.submissionId)
    }

  }
</script>

<style lang="scss" scoped>
  .cz-submission {
  }
</style>
