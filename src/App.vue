<template>
  <v-app md-waterfall app>
    <v-app-bar class="" color="bluegrey" fixed prominent elevate-on-scroll app>
      <router-link
        :to="{ path: `/` }"
        tag="img"
        class="logo"
        :src="require('@/assets/img/CZN_Logo.png')"
        alt="Critical Zone Network logo"
      >
      </router-link>
      <div class="spacer"></div>
      <div class="nav-items has-space-right md-elevation-2 md-medium-hide">
        <router-link to="/">
          <v-btn
            :class="{ 'is-active md-raised md-accent': isPathActive('/') }"
            :md-ripple="false"
            >Home</v-btn
          >
        </router-link>
        <router-link v-for="path of paths" :key="path.to" :to="path.to">
          <v-btn
            :class="{ 'is-active md-raised md-accent': isPathActive(path.to) }"
            :md-ripple="false"
            >{{ path.label }}</v-btn
          >
        </router-link>
      </div>
      <router-link v-if="!isLoggedIn" to="/login" class="md-medium-hide"
        ><v-btn class="md-raised">Log In</v-btn></router-link
      >
      <v-btn v-else class="md-raised md-medium-hide" @click="logOut()"
        >Log Out</v-btn
      >

      <v-app-bar-nav-icon @click.stop="showMobileNavigation = true">
        <v-icon>menu</v-icon>
      </v-app-bar-nav-icon>
    </v-app-bar>

    <v-main id="main-content" class="md-layout-item">
      <v-container>
        <v-sheet elevation="2">
          <router-view v-if="!isLoading" name="content" />
        </v-sheet>
      </v-container>
    </v-main>

    <v-footer>
      <router-view name="footer" />
    </v-footer>

    <v-navigation-drawer
      class="mobile-nav-items"
      v-model="showMobileNavigation"
      app
      temporary
    >
      <v-list nav dense class="nav-items">
        <v-list-item-group>
          <v-list-item
            @click="goToPath('/')"
            :class="{ 'is-active': isPathActive('/') }"
          >
            <v-icon>home</v-icon>
            <span class="md-list-item-text">Home</span>
          </v-list-item>

          <v-list-item
            v-for="path of paths"
            :key="path.to"
            @click="goToPath(path.to)"
            :class="{ 'is-active': isPathActive(path.to) }"
          >
            <v-icon>{{ path.icon }}</v-icon>
            <span class="md-list-item-text">{{ path.label }}</span>
          </v-list-item>
        </v-list-item-group>

        <v-divider></v-divider>

        <v-list-item-group>
          <router-link v-if="!isLoggedIn" to="/login">
            <v-list-item :class="{ 'is-active': isPathActive('/login') }">
              <v-icon>login</v-icon>
              <span class="md-list-item-text">Log In</span>
            </v-list-item>
          </router-link>

          <v-list-item v-else @click="logOut()">
            <v-icon>logout</v-icon>
            <span class="md-list-item-text">Log Out</span>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-snackbar
      v-model="snackbar.isActive"
      :timeout="snackbar.isInfinite ? -1 : snackbar.duration"
    >
      <span>{{ snackbar.message }}</span>

      <template v-slot:action="{ attrs }">
        <v-btn
          class="md-primary"
          @click="snackbar.isActive = false"
          v-bind="attrs"
          >Dismiss</v-btn
        >
      </template>
    </v-snackbar>

    <v-dialog
      v-model="dialog.isActive"
      persistent
      width="500"
      @md-cancel="
        dialog.onCancel();
        dialog.isActive = false;
      "
      @md-confirm="
        dialog.onConfirm();
        dialog.isActive = false;
      "
    >
      <v-card>
        <v-card-title>{{ dialog.title }}</v-card-title>
        <v-card-text>{{ dialog.content }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              dialog.isActive = false;
              dialog.onCancel();
            "
            color="green darken-1"
            text
          >
            {{ dialog.cancelText }}
          </v-btn>

          <v-btn
            @click="
              dialog.isActive = false;
              dialog.onConfirm();
            "
            color="green darken-1"
            text
          >
            {{ dialog.confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css" rel="stylesheet">
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { setupRouteGuards } from "./router";
import { Subscription } from "rxjs";
import { DEFAULT_TOAST_DURATION } from "./constants";
import CzNotification, { IDialog, IToast } from "./models/notifications.model";
import CzFooter from "@/components/base/cz.footer.vue";
import User from "@/models/user.model";
import Zenodo from "@/models/zenodo.model";
import HydroShare from "./models/hydroshare.model";
import Submission from "./models/submission.model";

@Component({
  name: "app",
  components: { CzFooter },
})
export default class App extends Vue {
  protected isLoading = true;
  protected onToast!: Subscription;
  protected onOpenDialog!: Subscription;
  protected showMobileNavigation = false;

  protected snackbar: IToast & { isActive: boolean; isInfinite: boolean } = {
    message: "",
    duration: DEFAULT_TOAST_DURATION,
    position: "center",
    isActive: false,
    isInfinite: false,
    // isPersistent: false,
  };

  protected dialog: IDialog & { isActive: boolean } = {
    title: "",
    content: "",
    confirmText: "",
    cancelText: "",
    isActive: false,
    onConfirm: () => {},
    onCancel: () => {},
  };

  protected paths = [
    {
      to: "/submissions",
      label: "My Submissions",
      icon: "collections_bookmark",
    },
    { to: "/resources", label: "Resources", icon: "local_library" },
    { to: "/submit", label: "Submit Data", icon: "upload_file" },
    { to: "/about", label: "About", icon: "help" },
    { to: "/contact", label: "Contact", icon: "contact_page" },
  ];

  protected get isLoggedIn() {
    return User.$state.isLoggedIn;
  }

  protected logOut() {
    CzNotification.openDialog({
      title: "Log out?",
      content: "Are you sure you want to log out?",
      confirmText: "Log Out",
      cancelText: "Cancel",
      onConfirm: () => {
        User.logOut();
      },
    });
  }

  protected isPathActive(path: string) {
    if (path === "/" && this.$route.path !== "/") {
      return false;
    }
    const matchedRoute = this.$router.match(path);
    const isActive = this.$route.matched.some(
      (r) => r.name === matchedRoute.name
    );

    if (isActive) {
      return true;
    }
    // Check if the route is active pending a redirect
    else if (this.$router.currentRoute.query.next) {
      const matchedNextRoute = this.$router.match(
        this.$router.currentRoute.query.next as string
      );
      return matchedNextRoute.name === matchedRoute.name;
    }

    return false; // default
  }

  protected goToPath(path: string) {
    this.showMobileNavigation = false;
    this.$router.push({ path });
  }

  async created() {
    document.title = "CZ Hub";

    if (this.$route.name !== "submissions") {
      // Only load submissions on app start if outside submissions page. Otherwise the submissions page will load them on 'created' lifecyecle hook
      Submission.fetchSubmissions();
    }

    this.onToast = CzNotification.toast$.subscribe((toast: IToast) => {
      this.snackbar = { ...this.snackbar, ...toast };
      this.snackbar.isActive = true;
    });

    this.onOpenDialog = CzNotification.dialog$.subscribe((dialog: IDialog) => {
      this.dialog = { ...this.dialog, ...dialog };
      this.dialog.isActive = true;
    });

    // Check for Authorization cookie instead.
    // const isAuthorized = this.$cookies.get('Authorization')

    // TODO: if the user is not logged in in the server, the client auth cookie needs to be deleted
    // Reproducible if the server is restarted

    // if (isAuthorized && !User.$state.isLoggedIn) {
    await User.checkAuthorization();
    // }

    if (User.$state.isLoggedIn) {
      await Promise.all([Zenodo.init(), HydroShare.init()]);
    }

    // Guards are setup after checking authorization and loading access tokens
    // because they depend on user logged in status
    setupRouteGuards();

    this.isLoading = false;
  }

  beforeDestroy() {
    // Good practice
    this.onToast.unsubscribe();
    this.onOpenDialog.unsubscribe();
  }
}
</script>

<style lang="scss" scoped>
// .md-toolbar.md-overlap-off .logo {
//   max-height: 7rem;
//   margin-top: unset;
//   padding: 1rem 0;
// }

// .md-toolbar {
//   // background: linear-gradient(-45deg, rgb(52, 107, 184) 0%, rgba(28,206,234,0.82) 100%);
// }

.logo {
  max-height: 100%;
  cursor: pointer;
}

.md-app {
  height: 100vh;
}

// ::v-deep .md-app-scroller {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// }

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

  a.router-link-exact-active .v-btn::before,
  .v-btn.is-active::before {
    background-color: currentColor;
    opacity: 0.12;
  }

  .v-btn {
    margin: 0;
    border-radius: 0;
  }

  ::v-deep .md-list-item .md-list-item-content {
    color: inherit;
    cursor: pointer;
  }

  ::v-deep .md-list-item.is-active .md-list-item-content,
  ::v-deep .router-link-exact-active .md-list-item-content {
    color: var(--md-theme-default-text-primary-on-accent, #fff) !important;
    background-color: var(--md-theme-default-accent, #0277bd);

    .v-icon {
      color: var(--md-theme-default-text-primary-on-accent, #fff) !important;
    }
  }
}

// @media screen and (min-width: 1279px) {
//   ::v-deep .md-list.nav-items,
//   ::v-deep .md-drawer.mobile-nav-items,

//   .mobile-nav-trigger {
//     display: none;
//   }
// }
</style>
