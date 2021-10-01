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
        <b-navbar-item tag="router-link" :to="{ path: `/submit` }">Submit Data</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: `/resources` }">Resources</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: `/contact` }">Contact</b-navbar-item>
      </template>

      <template #end>
        <b-navbar-item tag="div">
          <div class="buttons">
            <a class="button is-light">
              Log in
            </a>
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    name: 'cz-header-nav',
    components: { },
  })
  export default class CzHeaderNav extends Vue {

  }
</script>

<style lang="scss" scoped>
  
</style>
