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

<template>
  <div class="cz-profile">
    <v-navigation-drawer permanent :mini-variant="$vuetify.display.mdAndDown" class="flex-shrink-0">
      <template #prepend>
        <v-list-item two-line>
          <v-list-item-media>
            <v-icon left>
              fab fa-orcid
            </v-icon>
          </v-list-item-media>

          <!-- <v-list-item-title>email address here</v-list-item-title> -->
          <v-list-item-subtitle>Logged In</v-list-item-subtitle>
        </v-list-item>
      </template>

      <v-divider />

      <v-list dense>
        <v-list-item link :to="{ path: '/profile/account' }" prepend-icon="mdi-account-circle" active-class="active">
          <v-list-item-title>Account</v-list-item-title>
        </v-list-item>

        <v-list-item link :to="{ path: '/profile/authorized-repositories' }" prepend-icon="mdi-key" active-class="active">
          <v-list-item-title>Authorized Repositories</v-list-item-title>
        </v-list-item>

        <v-list-item id="drawer-nav-logout" prepend-icon="mdi-logout" @click="logOut()">
          <v-list-item-title>Log Out</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <div class="profile-content">
      <router-view name="CzAccount" />
      <router-view name="CzAuthorizedRepositories" />
    </div>
  </div>
</template>

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
