<template>
  <div class="cz-header-nav">
    <b-navbar>
      <template #brand>
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          CZnet
        </b-navbar-item>
      </template>

      <template #start>
        <b-navbar-item tag="router-link" :to="{ path: `/about` }">About</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: `/submissions` }">My Submissions</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: `/submit` }">Submit Data</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: `/resources` }">Resources</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: `/contact` }">Contact</b-navbar-item>
      </template>

      <template #end>
        <b-navbar-item tag="div">
          <div class="buttons">
            <router-link v-if="!isLoggedIn" to="/login">
              <b-button size="is-medium">Log In</b-button>
            </router-link>

            <b-button v-else size="is-medium" @click="logOut()">Log Out</b-button>
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import User from '@/models/user.model'

  @Component({
    name: 'cz-header-nav',
    components: { },
  })
  export default class CzHeaderNav extends Vue {
    protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }

    protected logOut() {
      User.logOut()
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .navbar-brand {
    margin-right: 4rem;
  }

  .navbar {
    border-bottom: 1px solid #DDD;
  }
  
</style>
