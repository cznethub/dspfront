<template>
  <div class="cz-new-submission">

    <section class="section">
      <div class="container">
        <div class="level">
          <h1 class="title is-1">New Submission</h1>
          <img :src="require('@/assets/img/placeholder.png')" alt="" style="width: 20rem;">
          <div>
            <b-button class="has-space-right" size="is-medium">Save</b-button>
            <b-button size="is-medium" type="is-primary">Submit</b-button>
          </div>
        </div>
        <p><b>Instructions</b>: Fill in the required fields (marked with *). Press the "Save" button to save your upload for later editing. When the form is complete, click the "Submit" button to upload your submission to the repository.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="min-height: 20rem;">
        <b-loading :is-full-page="false" :active="isLoading" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import Zenodo from '@/models/zenodo.model'
import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-new-submission',
    components: { },
  })
  export default class CzNewSubmission extends Vue {
    protected isLoading = true
    protected recordId = ''

    async created() {
      await Zenodo.createSubmission()
      this.isLoading = false
    }
  }
</script>

<style lang="scss" scoped>
  
</style>
