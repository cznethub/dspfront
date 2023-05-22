<template>
  <div class="cz-profile">
    <v-navigation-drawer permanent :mini-variant="$vuetify.display.mdAndDown" class="flex-shrink-0">
      <template v-slot:prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <v-icon left class="fab fa-orcid"></v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <!-- <v-list-item-title>email address here</v-list-item-title> -->
            <v-list-item-subtitle>Logged In</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider/>

      <v-list dense>
        <v-list-item link :to="{ path: '/profile/account' }" active-class="active">
          <v-list-item>
            <v-icon>mdi-account-circle</v-icon>
          </v-list-item>

          <v-list-item-content>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link :to="{ path: '/profile/authorized-repositories' }" active-class="active">
          <v-list-item>
            <v-icon>mdi-key</v-icon>
          </v-list-item>

          <v-list-item-content>
            <v-list-item-title>Authorized Repositories</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item id="drawer-nav-logout" @click="logOut()">
          <v-list-item>
            <v-icon>mdi-logout</v-icon>
          </v-list-item>

          <v-list-item-content>
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <div class="profile-content">
      <router-view name="CzAccount"></router-view>
      <router-view name="CzAuthorizedRepositories"></router-view>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-facing-decorator'

  @Component({
    name: 'cz-profile',
    components: { },
  })
  export default class CzProfile extends Vue {
    protected logOut() {
      this.$emit('logout')
    }
  }
</script>

<style lang="scss" scoped>
  .cz-profile {
    display: flex;
    min-height: 100%;

    .v-navigation-drawer {
      height: unset !important;
    }

    .profile-content {
      flex-grow: 1;
      padding: 2rem;
    }
  }
</style>
