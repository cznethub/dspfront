<template>
  <v-app app>
    <v-app-bar
      id="app-bar"
      color="navbar"
      scroll-behavior="elevate"
      fixed
      app
    >
      <v-container
        class="d-flex align-center full-height py-0"
      >
        <router-link :to="{ path: `/` }" class="logo">
          <img
            :src="`/img/${$t('logo')}`"
            :alt="`${$t('portalName')} home`"
          >
        </router-link>
        <v-spacer />
        <v-card
          v-if="!$vuetify.display.mdAndDown"
          class="nav-items mr-2 d-flex"
          :elevation="2"
        >
          <v-btn
            v-for="path of paths"
            v-bind="path.attrs"
            :id="`navbar-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
            :key="path.attrs.to || path.attrs.href"
            :elevation="0"
            :class="path.isActive && path.isActive() ? 'bg-primary' : ''"
            active-class="primary"
          >
            {{ path.label }}
            <v-icon v-if="path.isExternal" small class="ml-2" right>
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </v-card>

        <template v-if="!$vuetify.display.mdAndDown">
          <v-btn
            v-if="!isLoggedIn"
            id="navbar-login"
            variant="elevated"
            rounded
            @click="openLogInDialog()"
          >
            Log In
          </v-btn>
          <template v-else>
            <v-menu bottom left>
              <template #activator="{ props }">
                <v-btn
                  :color="
                    route.matched.some((p) => p.name === 'profile')
                      ? 'primary'
                      : 'white'
                  "
                  v-bind="props"
                  variant="elevated"
                  rounded
                >
                  <v-icon>mdi-account-circle</v-icon>
                  <v-icon>mdi-menu-down</v-icon>
                </v-btn>
              </template>

              <v-list class="pa-0">
                <v-list-item
                  :to="{ path: '/profile' }"
                  active-class="bg-primary"
                  prepend-icon="mdi-account-circle"
                >
                  <v-list-item-title>
                    Account & Settings
                  </v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item id="navbar-logout" prepend-icon="mdi-logout" @click="logOut()">
                  <v-list-item-title>Log Out</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </template>

        <v-app-bar-nav-icon
          v-if="$vuetify.display.mdAndDown"
          @click.stop="showMobileNavigation = true"
        />
      </v-container>
    </v-app-bar>

    <v-main app>
      <v-container id="main-container">
        <v-sheet :elevation="route.meta.hideMainSheet ? 0 : 2">
          <router-view v-if="!isLoading" :key="route.fullPath" name="content" @logout="logOut" />
        </v-sheet>
      </v-container>
    </v-main>

    <v-footer class="mt-8">
      <router-view name="footer" />
    </v-footer>

    <!-- NOTE: v-navigation-drawer is a single component for the entire app. Properties of other v-navigation-drawer instances will affect this one. -->
    <v-navigation-drawer
      v-model="showMobileNavigation"
      class="mobile-nav-items"
      temporary
      app
    >
      <v-list nav density="compact" class="nav-items">
        <v-list-item class="text-body-1">
          <v-list-item
            v-for="path of paths"
            :id="`drawer-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
            :key="path.attrs.to || path.attrs.href"
            v-bind="path.attrs"
            active-class="bg-primary"
            :class="path.isActive && path.isActive() ? 'primary' : ''"
            @click="showMobileNavigation = false"
          >
            <v-icon class="mr-2">
              {{ path.icon }}
            </v-icon>
            <span>{{ path.label }}</span>
            <v-icon v-if="path.isExternal" small class="ml-2" right>
              mdi-open-in-new
            </v-icon>
          </v-list-item>
        </v-list-item>

        <v-divider class="my-4" />

        <v-list-item class="text-body-1">
          <v-list-item
            v-if="!isLoggedIn"
            id="drawer-nav-login"
            @click="
              openLogInDialog();
              showMobileNavigation = false;
            "
          >
            <v-icon class="mr-2">
              mdi-login
            </v-icon>
            <span>Log In</span>
          </v-list-item>

          <template v-else>
            <v-list-item :to="{ path: '/profile' }" prepend-icon="mdi-account-circle">
              <span>Account & Settings</span>
            </v-list-item>

            <v-list-item id="drawer-nav-logout" prepend-icon="mdi-logout" @click="logOut()">
              <span>Log Out</span>
            </v-list-item>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <cz-notifications />

    <v-dialog v-model="logInDialog.isActive" width="500">
      <cz-login
        @cancel="logInDialog.isActive = false"
        @logged-in="logInDialog.onLoggedIn"
      />
    </v-dialog>

    <v-dialog v-model="authorizeDialog.isActive" width="45rem">
      <cz-authorize
        v-model:retry="authorizeDialog.retry"
        :repo="authorizeDialog.repo"
        @authorized="authorizeDialog.onAuthorized"
      />
    </v-dialog>
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
      rel="stylesheet"
    >
    <link
      href="https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css"
      rel="stylesheet"
    >
  </v-app>
</template>

<script lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { CzNotifications, Notifications } from '@cznethub/cznet-vue-core'
import { Subscription } from 'rxjs'
import { Component, toNative, Vue, Watch } from 'vue-facing-decorator'
import { useRoute, useRouter } from 'vue-router'
import CzLogin from '~/components/account/cz.login.vue'
import CzAuthorize from '~/components/authorize/cz.authorize.vue'
import CzFooter from '~/components/base/cz.footer.vue'
import User from '~/models/user.model'
// import Zenodo from '~/models/zenodo.model'
import { addRouteTags } from '~/modules/router'
import { EnumRepositoryKeys } from './components/submissions/types'
import { DEFAULT_TOAST_DURATION, DISCOVERY_SITE_URL } from './constants'
import { hasLoggedInGuard } from './guards'
import EarthChem from './models/earthchem.model'
import External from './models/external.model'
import HydroShare from './models/hydroshare.model'
import Repository from './models/repository.model'
import Submission from './models/submission.model'

const INITIAL_DIALOG = {
  title: '',
  content: '',
  confirmText: '',
  cancelText: '',
  isActive: false,
  onConfirm: () => {},
  onCancel: () => {},
}

const INITIAL_SNACKBAR = {
  message: '',
  duration: DEFAULT_TOAST_DURATION,
  position: 'center' as 'center' | 'left' | undefined,
  type: 'default' as 'default' | 'success' | 'error' | 'info',
  isActive: false,
  isInfinite: false,
  // isPersistent: false,
}

@Component({
  name: 'app',
  components: { CzFooter, CzLogin, CzAuthorize, CzNotifications },
})
class App extends Vue {
  isLoading = true
  onOpenLogInDialog!: Subscription
  onOpenAuthorizeDialog!: Subscription
  showMobileNavigation = false
  loggedInSubject = new Subscription()

  snackbar: any & { isActive: boolean, isInfinite: boolean }
    = INITIAL_SNACKBAR

  route = useRoute()
  router = useRouter()
  dialog: any & { isActive: boolean } = INITIAL_DIALOG
  logInDialog: any & { isActive: boolean } = {
    isActive: false,
    onLoggedIn: () => {},
    onCancel: () => {},
  }

  authorizeDialog: any & { isActive: boolean } = {
    isActive: false,
    retry: false,
    repo: '',
    onAuthorized: () => {},
    onCancel: () => {},
  }

  paths = [
    {
      attrs: { to: '/' },
      label: 'Home',
      icon: 'mdi-home',
      isActive: () => {
        return this.route?.name === 'home'
      },
    },
    {
      attrs: { to: '/submissions' },
      label: 'My Submissions',
      icon: 'mdi-bookmark-multiple',
      isActive: () => {
        return this.route?.name === 'submissions'
      },
    },
    {
      attrs: { to: '/resources' },
      label: 'Resources',
      icon: 'mdi-library',
      isActive: () => {
        return ['resources', 'quick-start-guide', 'recommendations'].includes(this.route?.name?.toString() || '')
      },
    },
    {
      attrs: { to: '/submit' },
      label: 'Submit Data',
      icon: 'mdi-book-plus',
      isActive: () => {
        return ['submit', 'submit.repository', 'register'].includes(this.route?.name?.toString() || '')
      },
    },
    {
      attrs: { href: DISCOVERY_SITE_URL },
      label: 'Discover Data',
      icon: 'mdi-card-search',
      isExternal: true,
    },
    { attrs: { to: '/about' }, label: 'About', icon: 'mdi-help', isActive: () => {
      return this.route?.name === 'about'
    } },

    {
      attrs: { to: '/contact' },
      label: 'Contact',
      icon: 'mdi-book-open-blank-variant',
      isActive: () => {
        return this.route?.name === 'contact'
      },
    },
  ]

  get isLoggedIn(): boolean {
    return User.$state.isLoggedIn
  }

  openLogInDialog() {
    User.openLogInDialog()
  }

  logOut() {
    Notifications.openDialog({
      title: 'Log out?',
      content: 'Are you sure you want to log out?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        User.logOut()

        if (this.route.matched.some(r => (r.beforeEnter as any[])?.includes(hasLoggedInGuard))) {
          this.router.push({ name: 'home' })
        }
      },
    })
  }

  /** Check if the user is still logged in after being idle for a while */
  @Watch('isAppIdle')
  onIdleChange(_wasActive: boolean, isActive: boolean) {
    if (isActive)
      User.checkAuthorization()
  }

  async created() {
    document.title = `${this.$t('hubName')}`
    addRouteTags(this.route, this.route)

    if ((this.route).name !== 'submissions') {
      // Only load submissions on app start if outside submissions page. Otherwise the submissions page will load them on 'created' lifecyecle hook
      Submission.fetchSubmissions()
    }

    this.onOpenLogInDialog = User.logInDialog$.subscribe(
      (redirectTo?: RouteLocationRaw) => {
        this.logInDialog.isActive = true

        this.logInDialog.onLoggedIn = () => {
          if (redirectTo)

            this.router.push(redirectTo).catch(() => {})

          this.logInDialog.isActive = false
        }
      },
    )

    this.onOpenAuthorizeDialog = Repository.authorizeDialog$.subscribe(
      (params: {
        repository: string
        redirectTo?: RouteLocationRaw | undefined
      }) => {
        this.authorizeDialog.repo = params.repository
        this.authorizeDialog.retry = false
        this.authorizeDialog.isActive = true
        this.authorizeDialog.onAuthorized = async (response?: any) => {
          if (response?.error) {
            this.authorizeDialog.retry = true
            return
          }
          if (params.redirectTo) {
            if (params.repository === EnumRepositoryKeys.hydroshare)
              await HydroShare.init()
            // else if (params.repository === EnumRepositoryKeys.zenodo)
            //   await Zenodo.init()
            else if (params.repository === EnumRepositoryKeys.earthchem)
              await EarthChem.init()

            this.router.push(params.redirectTo).catch(() => {})
          }
          this.authorizeDialog.isActive = false
        }
      },
    )

    // Check for Authorization cookie instead.
    // const isAuthorized = this.$cookies.get('Authorization')

    // TODO: if the user is not logged in in the server, the client auth cookie needs to be deleted
    // Reproducible if the server is restarted

    // if (isAuthorized && !User.$state.isLoggedIn) {
    await User.checkAuthorization()
    // }

    User.$state.isLoggedIn
      ? await this._initRepositories()
      : this.loggedInSubject = User.loggedIn$.subscribe(async () => {
        await this._initRepositories()
      })

    this.isLoading = false
  }

  private _initRepositories() {
    return Promise.all([
      HydroShare.init(),
      EarthChem.init(),
      // Zenodo.init(),
      External.init(),
    ])
  }

  beforeDestroy() {
    // Good practice
    this.onOpenLogInDialog.unsubscribe()
    this.onOpenAuthorizeDialog.unsubscribe()
    this.loggedInSubject.unsubscribe()
  }
}

export default toNative(App)
</script>

<style lang="scss" scoped>
.logo {
  height: 100%;
  cursor: pointer;

  img {
    height: 100%;
  }
}

#footer {
  width: 100%;
  margin: 0;
  min-height: unset;
  margin-top: 4rem;
  box-shadow: none;
}

.v-toolbar.v-app-bar--is-scrolled > .v-toolbar__content > .container {
  align-items: center !important;
  will-change: padding;
  padding-top: 0;
  padding-bottom: 0;
}

.nav-items {
  border-radius: 2rem !important;
  overflow: hidden;

  & > a.v-btn:first-child {
    border-top-left-radius: 2rem !important;
    border-bottom-left-radius: 2rem !important;
  }

  & > a.v-btn:last-child {
    border-top-right-radius: 2rem !important;
    border-bottom-right-radius: 2rem !important;
  }

  .v-btn {
    margin: 0;
    border-radius: 0;
    height: 39px !important;
  }
}
</style>
