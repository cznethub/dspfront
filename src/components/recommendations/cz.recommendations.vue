<template>
  <div class="cz-recommendations">
    <div class="banner is-flex is-flex-direction-column is-align-items-center">
      <h1 class="has-space-bottom">Repository Recommendations</h1>
      <h3>Find the Best Repository for Your Research Products</h3>
    </div>

    <div class="cz-recommendations-content">
      <div class="is-flex is-justify-content-center is-flex-wrap-wrap">
        <div class="is-flex is-flex-direction-column is-align-items-center data-descriptor">
          <i class="far fa-plus-square" />
          <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">I have geospatial data</h3>
          <p class="has-text-mute has-text-centered has-text-weight-light">Learn more about formats, best practices, and repositories for geospatial data.</p>
        </div>

        <div class="is-flex is-flex-direction-column is-align-items-center data-descriptor">
          <i class="far fa-plus-square" />
          <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">My data are derived from

physical samples</h3>
          <p class="has-text-mute has-text-centered has-text-weight-light">Learn more about registering physical samples and submitting data derived from samples.</p>
        </div>

        <div class="is-flex is-flex-direction-column is-align-items-center data-descriptor">
          <i class="far fa-plus-square" />
          <h3 class="has-text-weight-medium has-space-bottom has-text-centered has-space-top spacer">I want to submit multiple

types of data together</h3>
          <p class="has-text-mute has-text-centered has-text-weight-light">Learn more about best practices for assembling multiple datasets for a project or publication. </p>
        </div>
      </div>

      <hr>

      <div class="is-flex is-flex-direction-column is-align-items-center has-space-top-2x has-space-bottom-2x">
        <h1 class="has-space-bottom-2x">Not Sure? Let us Help You Decide</h1>
        <p class="has-text-mute has-space-bottom-2x">Click the button below to begin an interactive questionnaire that will help us identify which data formats, best practices, and repository is right for your data. </p>
        <button class="button is-size-4">Repository Recommendations</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-recommendations',
    components: { },
  })
  export default class CzRecommendations extends Vue {

  }
</script>

<style lang="scss" scoped>
  .cz-recommendations-content {
    padding: 4rem 2rem;
  }

  .banner {
    padding: 4rem 2rem;
    background: var(--bg-light-gray);
  }

  .data-descriptor {
    margin: 3rem;
    width: 28rem;
    flex-shrink: 0;

    p {
      height: 6.3rem;
    }

    i {
      font-size: 6rem;
    }
  }
</style>
