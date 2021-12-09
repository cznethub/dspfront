<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="overlap">
      <md-app-toolbar class="md-primary md-layout md-alignment-top-center">
        <div class="md-toolbar-row md-layout-item content">
          <router-link :to="{ path: `/` }">
            <img class="logo" :src="require('@/assets/img/CZN_Logo.png')" alt="Critical Zone Network logo">
          </router-link>
          <div class="spacer"></div>
          <div class="nav-items has-space-right md-elevation-2 md-medium-hide">
            <router-link to="/">
              <md-button :class="{'is-active md-raised md-accent': isPathActive('/')}" :md-ripple="false">Home</md-button>
            </router-link>
            <router-link v-for="path of paths" :key="path.to" :to="path.to">
              <md-button :class="{'is-active md-raised md-accent': isPathActive(path.to)}" :md-ripple="false">{{ path.label }}</md-button>
            </router-link>
          </div>
          <router-link v-if="!isLoggedIn" to="/login" class="md-medium-hide"><md-button class="md-raised">Log In</md-button></router-link>
          <md-button v-else class="md-raised md-medium-hide" @click="logOut()">Log Out</md-button>

          <md-button class="md-icon-button md-raised mobile-nav-trigger" @click="showMobileNavigation = true">
            <md-icon>menu</md-icon>
          </md-button>
        </div>
      </md-app-toolbar>

      <md-app-content id="main-content" class="md-layout-item">
        <router-view v-if="!isLoading" name="content" />
      </md-app-content>

      <md-app-content id="footer">
        <router-view name="footer" /> 
      </md-app-content>
    </md-app>

    <md-snackbar
      :md-active.sync="snackbar.isActive"
      :md-position="snackbar.position"
      :md-persistent="snackbar.isPersistent"
      :md-duration="snackbar.isInfinite ? Infinity : snackbar.duration"
    >
      <span>{{ snackbar.message }}</span>
      <md-button class="md-primary" @click="snackbar.isActive = false">Dismiss</md-button>
    </md-snackbar>

    <md-dialog-confirm
      :md-active.sync="dialog.isActive"
      :md-title="dialog.title"
      :md-content="dialog.content"
      :md-confirm-text="dialog.confirmText"
      :md-cancel-text="dialog.cancelText"
      @md-cancel="dialog.onCancel"
      @md-confirm="dialog.onConfirm" />

    <md-drawer class="mobile-nav-items" :md-active.sync="showMobileNavigation" md-swipeable>
      <md-toolbar class="md-transparent" md-elevation="0">
        <div style="width: 100%;">
          <router-link :to="{ path: `/` }">
            <img :src="require('@/assets/img/CZN_Logo.png')" alt="Critical Zone Network logo">
          </router-link>
          <hr>
        </div>
      </md-toolbar>

      <md-list class="nav-items">
        <md-list-item @click="goToPath('/')" :class="{'is-active': isPathActive('/')}">
          <md-icon>home</md-icon>
          <span class="md-list-item-text">Home</span>
        </md-list-item>

        <!-- <md-button :class="{'is-active md-raised md-accent': isPathActive(path.to)}" :md-ripple="false">{{ path.label }}</md-button> -->
        <md-list-item v-for="path of paths" :key="path.to" @click="goToPath(path.to)" :class="{'is-active': isPathActive(path.to)}">
          <md-icon>{{ path.icon }}</md-icon>
          <span class="md-list-item-text">{{ path.label }}</span>
        </md-list-item>

        <md-divider></md-divider>

        <router-link v-if="!isLoggedIn" to="/login">
          <md-list-item :class="{'is-active': isPathActive('/login')}">
            <md-icon>login</md-icon>
            <span class="md-list-item-text">Log In</span>
          </md-list-item>
        </router-link>

        <md-list-item v-else @click="logOut()">
          <md-icon>logout</md-icon>
          <span class="md-list-item-text">Log Out</span>
        </md-list-item>
      </md-list>
    </md-drawer>

    <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons">
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { setupRouteGuards } from './router'
  import { Subscription } from 'rxjs'
  import { DEFAULT_TOAST_DURATION } from './constants'
  import CzNotification, { IDialog, IToast } from './models/notifications.model'
  import CzFooter from '@/components/base/cz.footer.vue'
  import User from '@/models/user.model'
  import Zenodo from '@/models/zenodo.model'
  import HydroShare from './models/hydroshare.model'
  import Submission from './models/submission.model'
  
  @Component({
    name: 'app',
    components: { CzFooter },
  })
  export default class App extends Vue {
    protected isLoading = true
    protected onToast!: Subscription
    protected onOpenDialog!: Subscription
    protected showMobileNavigation = false

    protected snackbar: IToast & { isActive: boolean, isInfinite: boolean } = {
      message: '',
      duration: DEFAULT_TOAST_DURATION,
      position: 'center',
      isActive: false,
      isInfinite: false,
      // isPersistent: false,
    }

    protected dialog: IDialog & { isActive: boolean } = {
      title: '',
      content: '',
      confirmText: '',
      cancelText: '',
      isActive: false,
      onConfirm: () => {},
      onCancel: () => {},
    }

    protected paths = [
      { to: '/submissions', label: 'My Submissions', icon: 'collections_bookmark' },
      { to: '/resources', label: 'Resources', icon: 'local_library' },
      { to: '/submit', label: 'Submit Data', icon: 'upload_file' },
      { to: '/about', label: 'About', icon: 'help' },
      { to: '/contact', label: 'Contact', icon: 'contact_page' },
    ]

    protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }

    protected logOut() {
      CzNotification.openDialog({
        title: 'Log out?',
        content: 'Are you sure you want to log out?',
        confirmText: 'Log Out',
        cancelText: 'Cancel',
        onConfirm: () => {
          User.logOut()
        }
      })
    }

    protected isPathActive(path: string) {
      if (path === '/' && this.$route.path !== '/') {
        return false
      }
      const matchedRoute = this.$router.match(path)
      const isActive = this.$route.matched.some(r => r.name === matchedRoute.name)

      if (isActive) {
        return true
      }
      // Check if the route is active pending a redirect
      else if (this.$router.currentRoute.query.next) {
        const matchedNextRoute = this.$router.match(this.$router.currentRoute.query.next as string)
        return matchedNextRoute.name === matchedRoute.name
      }

      return false  // default
    }

    protected goToPath(path: string) {
      this.showMobileNavigation = false
      this.$router.push({ path })
    }

    async created() {
      document.title = 'CZ Hub'

      if (this.$route.name !== 'submissions') {
        // Only load submissions on app start if outside submissions page. Otherwise the submissions page will load them on 'created' lifecyecle hook
        Submission.fetchSubmissions()
      }

      this.onToast = CzNotification.toast$.subscribe((toast: IToast) => {
        this.snackbar = { ...this.snackbar, ...toast }
        this.snackbar.isActive = true
      })

      this.onOpenDialog = CzNotification.dialog$.subscribe((dialog: IDialog) => {
        this.dialog = { ...this.dialog, ...dialog }
        this.dialog.isActive = true
      })
      
      // Check for Authorization cookie instead. 
      // const isAuthorized = this.$cookies.get('Authorization')

      // TODO: if the user is not logged in in the server, the client auth cookie needs to be deleted
      // Reproducible if the server is restarted
      
      // if (isAuthorized && !User.$state.isLoggedIn) {
      await User.checkAuthorization()
      // }
      
      if (User.$state.isLoggedIn) {
        await Promise.all([
          Zenodo.init(),
          HydroShare.init()
        ])
      }

      // Guards are setup after checking authorization and loading access tokens
      // because they depend on user logged in status
      setupRouteGuards()
      
      this.isLoading = false
    }

    beforeDestroy() {
      // Good practice
      this.onToast.unsubscribe()
      this.onOpenDialog.unsubscribe()
    }
  }
</script>

<style lang="scss" scoped>
  .md-toolbar.md-overlap-off .logo {
    max-height: 7rem;
    margin-top: unset;
    padding: 1rem 0;
  }

  .md-toolbar {
    // background: linear-gradient(-45deg, rgb(52, 107, 184) 0%, rgba(28,206,234,0.82) 100%);
  }

  .logo {
    max-height: 117px;
    transition: max-height 0.25s ease;
    will-change: max-height, margin-top;
    margin-top: -6rem;
  }

  .md-app {
    height: 100vh;
  }

  /deep/ .md-app-scroller {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #footer {
    width: 100%;
    margin: 0;
    min-height: unset;
    margin-top: 4rem;
    background: var(--md-theme-default-primary);
    box-shadow: none;
  }

  .nav-items {
    background: var(--md-theme-default-background, #fff);
    border-radius: 2rem;
    overflow: hidden;

    a.router-link-exact-active .md-button::before,
    .md-button.is-active::before {
      background-color: currentColor;
      opacity: .12;
    }

    .md-button {
      margin: 0;
      border-radius: 0;
    }

    /deep/ .md-list-item .md-list-item-content {
      color: inherit;
      cursor: pointer;
    }

    /deep/ .md-list-item.is-active .md-list-item-content,
    /deep/ .router-link-exact-active .md-list-item-content {
      color: var(--md-theme-default-text-primary-on-accent, #fff) !important;
      background-color: var(--md-theme-default-accent, #0277bd);

      .md-icon {
        color: var(--md-theme-default-text-primary-on-accent, #fff) !important;
      }
    }
  }

  @media screen and (min-width: 1279px) {
    /deep/ .md-list.nav-items,
    /deep/ .md-drawer.mobile-nav-items,

    .mobile-nav-trigger {
      display: none;
    }
  }
</style>
