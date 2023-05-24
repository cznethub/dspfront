<template>
  <div class="cz-recommendations">
    <div class="banner text-center has-bg-light-gray">
      <div class="text-subtitle-1 mb-12">Coming soon: This page will provide functionality that will help you decide which repository to use for your data.</div>
      <div class="has-space-bottom text-h4">Repository Recommendations</div>
      <div class="text-h5">Find the Best Repository for Your Research Products</div>
    </div>

    <v-container>
      <div id="options-grid">
        <v-hover>
          <template #default="{ hover }">
            <v-card :class="`elevation-${ hover ? 12 : 2 } has-cursor-pointer transition-swing`">
              <v-card-text class="text-center">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <div class="has-text-weight-medium has-space-bottom text-center has-space-top spacer text-h6">I have geospatial data</div>
                <p class="text--secondary text-center text-subtitle-1">Learn more about formats, best practices, and repositories for geospatial data.</p>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>

        <v-hover>
          <template #default="{ hover }">
            <v-card :class="`elevation-${ hover ? 12 : 2 } has-cursor-pointer transition-swing`">
              <v-card-text class="text-center">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <div class="has-text-weight-medium has-space-bottom text-center has-space-top spacer text-h6">My data are derived from physical samples</div>
                <p class="text--secondary text-center text-subtitle-1">Learn more about registering physical samples and submitting data derived from samples.</p>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>

        <v-hover>
          <template #default="{ hover }">
            <v-card :class="`elevation-${ hover ? 12 : 2 } has-cursor-pointer transition-swing`">
              <v-card-text class="text-center">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <div class="has-text-weight-medium has-space-bottom text-center has-space-top spacer text-h6">I want to submit multiple types of data together</div>
                <p class="text--secondary text-center text-subtitle-1">Learn more about best practices for assembling multiple datasets for a project or publication.</p>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>

        <v-hover>
          <template #default="{ hover }">
            <v-card :class="`elevation-${ hover ? 12 : 2 } has-cursor-pointer transition-swing`">
              <v-card-text class="text-center">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <div class="has-text-weight-medium has-space-bottom text-center has-space-top spacer text-h6">I have time series data from sensors</div>
                <p class="text--secondary text-center text-subtitle-1">Learn more about more about formats, best practices, and repositories for geospatial data.</p>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>
      </div>
    </v-container>

    <v-divider />

    <section class="d-flex flex-column align-center">
      <div class="text-h4 mb-4">Not Sure? Let us Help You Decide</div>
      <p class="text--secondary mb-4 text-center">Click the button below to begin an interactive questionnaire that will help us identify which data formats, best practices, and repository is right for your data. </p>
      <v-btn to="/resources/recommendations-questionnaire" color="primary">Repository Recommendations</v-btn>
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-facing-decorator'

  @Component({
    name: 'cz-recommendations',
    components: { },
  })
  export default class CzRecommendations extends Vue {

  }
</script>

<style lang="scss" scoped>

  #options-grid {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
    gap: 2rem;

    .v-icon {
      font-size: 5rem;
    }
  }
</style>
