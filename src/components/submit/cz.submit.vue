<template>
  <div class="cz-submit">
    <div class="banner">
      <div class="container is-flex is-flex-direction-column is-justify-content-center is-align-items-center">
        <h1 class="has-space-bottom-2x has-text-weight-medium">Submit Data</h1>
        <h2 class="has-text-mute has-space-bottom-2x">Not sure which repository to use?</h2>
        <router-link to="/recommendations">
          <button class="button is-size-4">Help Me Decide</button>
        </router-link>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <h1 class="has-space-bottom-2x has-text-centered has-space-top-2x">Submit to a Supported Repository</h1>

        <div class="is-flex is-justify-content-center has-space-bottom-2x">
          <div class="repositories">
            <div v-for="repo of repoMetadata" :key="repo.key" class="card">
              <div class="card-image is-flex is-justify-content-center">
                <figure class="image">
                  <img :src="require('@/assets/img/placeholder.png')" alt="">
                </figure>
              </div>
              
              <div class="card-content">
                <b-button @click="submitTo(repo)" class="block has-text-left" type="is-primary" size="is-large" outlined expanded>
                  <p class="is-size-5">{{ repo.submitLabel || `Submit to` }}</p>
                  <p class="has-text-weight-bold">{{ repo.name }}</p>
                </b-button>
                <p class="has-text-mute">{{ repo.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr>

    <section class="section">
      <div class="is-flex has-space-bottom-2x container">
        <div>
          <h1 class="block">Register a product submitted to another repository</h1>
          <p class="has-text-mute block">The repositories above may not be a good fit for every CZCN dataset. If you decide to submit a dataset with another repository, register it here. Registering will create a metadata record for the dataset within the HydroShare repository to ensure that your data can still be discovered with all of the other CZCN research products.</p>
          <button class="button is-size-4">Register</button>
        </div>
        <img :src="require('@/assets/img/placeholder.png')" alt="" style="width: 20rem; flex-shrink: 0; align-self: center; margin-left: 10rem;">
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { repoMetadata } from '@/components/submit/constants'
  import { IRepository } from '@/components/submissions/types'
import Zenodo from '@/models/zenodo.model'

  @Component({
    name: 'cz-submit',
    components: { },
  })
  export default class CzSubmit extends Vue {
    protected repoMetadata = repoMetadata

    protected submitTo(repo: IRepository) {
      if (Zenodo.isAuthorized) {
        this.$router.push({ path: '/new-submission' })
      }
      else {
        this.$router.push({ path: '/authorize', query: { repo: repo.key } })
      }
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
    grid-template-columns: repeat(auto-fill, minmax(40rem, 1fr));
    column-gap: 4rem;
    row-gap: 4rem;

    .card {
      div.card-image {
        background: linear-gradient(180deg, #c3cbd2 0%, #f2f3f5 100%);
      }

      button {
        height: auto;
      }

    }
    

    img {
      width: 20rem;
    }
  }
</style>
