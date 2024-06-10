<template>
  <div class="cz-profile">
    <v-navigation-drawer permanent :expand-on-hover="$vuetify.display.mdAndDown" mobile-breakpoint="md" class="flex-shrink-0">
      <template #prepend>
        <v-list-item>
          <v-list-item-subtitle class="d-flex align-center my-4">
            <i left class="fab fa-orcid mr-2" style="font-size: 1.5rem" aria-hidden="true" /> Logged In
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <v-divider />

      <v-list density="compact" nav>
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

<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'

@Component({
  name: 'cz-profile',
  components: { },
})
class CzProfile extends Vue {
  logOut() {
    this.$emit('logout')
  }
}
export default toNative(CzProfile)
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
