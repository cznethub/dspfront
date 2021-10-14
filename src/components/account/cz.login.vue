<template>
  <section class="cz-login section">
    <div class="container">
      <div class="is-flex is-flex-direction-column is-align-items-center">
        <h1 class="title is-1">Critical Zone Collaborative Network</h1>
        <h3 class="has-text-mute has-space-bottom">Data Submission Portal</h3>

        <div class="panel has-space-bottom-2x">
          <div class="panel-heading">Log In</div>
          <div class="panel-block is-flex is-flex-direction-column has-space-bottom">
            <b-button @click="goToOrcidLogin()" size="is-medium" expanded type="is-primary">
              <div class="level">
                <i class="fab fa-orcid has-space-right is-size-3" />
                <span>Log In Using ORCID</span>
              </div>
            </b-button>
            <p class="block">User accounts in the Data Submission Portal are managed using your ORCID® iD. An ORCID iD is a persistent digital identifier that you own and control and that distinguishes you from every other researcher.</p>
            <p class="block">If you have an ORCID already, click the button above to get started. If you don't have an ORCID yet, getting one is easy. Visit <a href="https://orcid.org" target="_blank">https://orcid.org</a> to register and get your unique ORCID iD.</p>
            <img :src="require('@/assets/img/placeholder.png')" style="width: 10rem;" alt="">
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
  import User from '@/models/user.model'
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-login',
    components: { },
  })
  export default class CzLogin extends Vue {
    created() {
      console.log(
        // this.$route, 
        // this.$cookies, 
        this.$cookies.get('Authorization')
      )
    }

    protected goToOrcidLogin() {
      const next = this.$route.query.next
      // Save the next route in the model before navigating away
      if (next) {
        User.commit((state) => {
          state.next = next
        })
      }
      window.location.replace('/api/login')
    }
  }
</script>

<style lang="scss" scoped>
  .panel {
    max-width: 40rem;
  }

  .panel-heading {
    text-align: center;
  }
</style>
