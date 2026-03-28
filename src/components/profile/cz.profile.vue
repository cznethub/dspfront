<template>
  <div class="cz-profile">
    <v-list class="flex-shrink-0 border-e-thin" nav>
      <v-list-item>
        <v-list-item-subtitle class="d-flex align-center my-4 text-body-1">
          <i
            class="fab fa-orcid mr-2"
            style="font-size: 1.5rem"
            aria-hidden="true"
          />
          <span v-if="$vuetify.display.mdAndUp">Logged In</span>
        </v-list-item-subtitle>
        <v-divider />
      </v-list-item>

      <v-list-item
        link
        :to="{ path: '/profile/account' }"
        active-class="active"
      >
        <v-list-item-title class="d-flex align-center gap-1">
          <v-icon size="x-large" class="text-medium-emphasis" title="Account">
            mdi-account-circle
          </v-icon>
          <span v-if="$vuetify.display.mdAndUp">Account</span>
        </v-list-item-title>
      </v-list-item>

      <!-- <v-list-item
        link :to="{ path: '/profile/authorized-repositories' }"
        active-class="active"
      >
        <v-list-item-title class="d-flex align-center gap-1">
          <v-icon size="x-large" class="text-medium-emphasis" title="Authorized Repositories">
            mdi-key
          </v-icon>
          <span v-if="$vuetify.display.mdAndUp">Authorized Repositories</span>
        </v-list-item-title>
      </v-list-item> -->

      <v-divider class="my-4" />

      <v-list-item id="drawer-nav-logout" @click="logOut()">
        <v-list-item-title class="d-flex align-center gap-1">
          <v-icon size="x-large" class="text-medium-emphasis" title="Log Out">
            mdi-logout
          </v-icon>
          <span v-if="$vuetify.display.mdAndUp">Log Out</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <div class="profile-content">
      <router-view name="CzAccount" />
      <router-view name="CzAuthorizedRepositories" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'cz-profile' })

const emit = defineEmits<{ logout: [] }>()

function logOut() {
  emit('logout')
}
</script>

<style lang="scss" scoped>
.cz-profile {
  display: flex;
  min-height: 100%;

  .profile-content {
    flex-grow: 1;
    padding: 2rem;
  }
}
</style>
