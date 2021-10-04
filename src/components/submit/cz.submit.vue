<template>
  <div class="cz-submit">
    <div class="banner">
      <div class="container is-flex is-flex-direction-column is-justify-content-center is-align-items-center">
        <h1 class="has-space-bottom-2x has-text-weight-medium">Submit Data</h1>
        <h2 class="has-text-mute has-space-bottom-2x">Not sure which repository to use?</h2>
        <button class="button is-size-4" @click="goToRecommendations">Help Me Decide</button>
      </div>
    </div>

    <div class="cz-submit-content container">
      <h1 class="has-space-bottom-2x has-text-centered has-space-top-2x">Submit to a Supported Repository</h1>

      <div class="is-flex is-justify-content-center has-space-bottom-2x">
        <div class="repositories">
          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold has-space-bottom">Submit to HydroShare</h4>
            <p class="has-text-mute has-text-weight-light">HydroShare is a general-purpose domain repository the primarily serves the water science community. HydroShare is operated by the Consortium of Universities for the Advancement of Hydrologic Science, Inc. (CUAHSI). Data types include geographic feature, geographic raster, multidimensional, time series, model programs, model instances, and generic data types.</p>
          </div>

          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold has-space-bottom">Submit to the EarthChem Library</h4>
            <p class="has-text-mute has-text-weight-light">The EarthChem Library is a domain repository that primarily serves the geochemistry community. The EarthChem Library is operated by the Lamont-Doherty Earth Observatory of Columbia University. Data types include bulk elemental analysis (majors, traces), bulk isotope analysis, mineral analysis (in-situ analysis), melt inclusion analysis, and many more.</p>
          </div>

          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold has-space-bottom">Register Samples with SESAR</h4>
            <p class="has-text-mute has-text-weight-light">The System for Earth Sample Registration (SESAR) is a global registry for specimens (rocks, sediments, minerals, fossils, fluids, gas) and related sampling features from our natural environment. SESAR's objective is to overcome the problem of ambiguous sample naming in the Earth Sciences. SESAR maintains a database of sample records that are contributed by its users. Each sample that is registered with SESAR is assigned an International Geo Sample Number IGSN to ensure its global unique identification.</p>
          </div>

          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold has-space-bottom">Submit LiDAR Data to Open Topography</h4>
            <p class="has-text-mute has-text-weight-light">Open Topography is a repository for high-resolution, Earth science-oriented, topography and bathymetry data and related tools and resources. Open Topography is operated at the San Diego Supercomputer Center at the University of California San Diego. </p>
          </div>

          <img :src="require('@/assets/img/placeholder.png')" alt="">
          <div>
            <h4 class="has-text-weight-bold has-space-bottom">Submit to Zenodo</h4>
            <p class="has-text-mute has-text-weight-light">Zenodo is a general-purpose, domain-agnostic repository that serves as a "catch-all" repository for EC funded research. Zenodo is operated by CERN in partnership with the OpenAIRE project. </p>
          </div>
        </div>
      </div>

      <hr>

      <section class="section is-flex has-space-bottom-2x">
        <div>
          <h1 class="has-space-bottom-2x">Register a product submitted to another repository</h1>
          <p class="has-text-mute has-text-weight-light has-space-bottom-2x">The repositories above may not be a good fit for every CZCN dataset. If you decide to submit a dataset with another repository, register it here. Registering will create a metadata record for the dataset within the HydroShare repository to ensure that your data can still be discovered with all of the other CZCN research products.</p>
          <button class="button is-size-4">Register</button>
        </div>
        <img :src="require('@/assets/img/placeholder.png')" alt="" style="width: 20rem; flex-shrink: 0; align-self: center; margin-left: 10rem;">
      </section>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-submit',
    components: { },
  })
  export default class CzSubmit extends Vue {
    protected goToRecommendations() {
      this.$router.push({ path: '/recommendations' })
    }
  }
</script>

<style lang="scss" scoped>
  .banner {
    padding: 4rem 2rem;
    background: var(--bg-light-gray);
  }

  .repositories {
    display: grid;
    max-width: 100rem;
    grid-template-columns: auto auto;
    row-gap: 4rem;
    column-gap: 6rem;

    img {
      width: 20rem;
    }
  }
</style>
