<template>
  <v-app app>
    <v-app-bar
      ref="appBar"
      id="app-bar"
      color="blue-grey lighten-4"
      elevate-on-scroll
      fixed
      app
    >
      <v-container
        class="d-flex align-center full-height pa-0"
        :class="{ 'pa-0 align-center': isSafari }"
      >
        <router-link :to="{ path: `/` }" class="logo">
          <img
            :src="require('@/assets/img/CZN_Logo.png')"
            alt="Critical Zone Network home"
          />
        </router-link>
        <div class="spacer"></div>
        <v-card
          class="nav-items mr-2 d-flex"
          :elevation="2"
          v-if="!$vuetify.breakpoint.mdAndDown"
        >
          <v-btn
            id="navbar-nav-home"
            to="/"
            :elevation="0"
            active-class="primary"
            >Home</v-btn
          >
          <v-btn
            v-for="path of paths"
            :key="path.attrs.to || path.attrs.href"
            v-bind="path.attrs"
            :id="`navbar-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
            :elevation="0"
            active-class="primary"
            :class="path.isActive && path.isActive() ? 'primary' : ''"
          >
            {{ path.label }}
            <v-icon v-if="path.isExternal" small class="ml-2" right
              >mdi-open-in-new</v-icon
            >
          </v-btn>
        </v-card>

        <template v-if="!$vuetify.breakpoint.mdAndDown">
          <v-btn
            id="navbar-login"
            v-if="!isLoggedIn"
            @click="openLogInDialog()"
            rounded
            >Log In</v-btn
          >
          <template v-else>
            <v-menu bottom left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :color="
                    $route.matched.some((p) => p.name === 'profile')
                      ? 'primary'
                      : ''
                  "
                  elevation="2"
                  rounded
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-account-circle</v-icon>
                  <v-icon>mdi-menu-down</v-icon>
                </v-btn>
              </template>

              <v-list class="pa-0">
                <v-list-item
                  :to="{ path: '/profile' }"
                  active-class="primary white--text"
                >
                  <v-list-item-icon class="mr-2">
                    <v-icon>mdi-account-circle</v-icon>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title>Account & Settings</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item id="navbar-logout" @click="logOut()">
                  <v-list-item-icon class="mr-2">
                    <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title>Log Out</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </template>

        <v-app-bar-nav-icon
          @click.stop="showMobileNavigation = true"
          v-if="$vuetify.breakpoint.mdAndDown"
        />
      </v-container>
    </v-app-bar>

    <v-main app>
      <v-container id="main-container">
        <v-sheet :elevation="$route.meta.hideMainSheet ? 0 : 2">
          <router-view v-if="!isLoading" name="content" @logout="logOut" />
        </v-sheet>
      </v-container>
    </v-main>

    <v-footer class="mt-8">
      <router-view name="footer" />
    </v-footer>

    <v-navigation-drawer
      class="mobile-nav-items"
      v-model="showMobileNavigation"
      temporary
      app
    >
      <v-list nav dense class="nav-items">
        <v-list-item-group class="text-body-1">
          <v-list-item
            id="drawer-nav-home"
            @click="showMobileNavigation = false"
            to="/"
            active-class="primary white--text"
          >
            <v-icon class="mr-2">mdi-home</v-icon>
            <span>Home</span>
          </v-list-item>

          <v-list-item
            v-for="path of paths"
            :id="`drawer-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
            :key="path.attrs.to || path.attrs.href"
            v-bind="path.attrs"
            @click="showMobileNavigation = false"
            active-class="primary white--text"
            :class="path.isActive && path.isActive() ? 'primary' : ''"
          >
            <v-icon class="mr-2">{{ path.icon }}</v-icon>
            <span>{{ path.label }}</span>
            <v-icon v-if="path.isExternal" small class="ml-2" right
              >mdi-open-in-new</v-icon
            >
          </v-list-item>
        </v-list-item-group>

        <v-divider class="my-4"></v-divider>

        <v-list-item-group class="text-body-1">
          <v-list-item
            id="drawer-nav-login"
            v-if="!isLoggedIn"
            @click="
              openLogInDialog();
              showMobileNavigation = false;
            "
          >
            <v-icon class="mr-2">mdi-login</v-icon>
            <span>Log In</span>
          </v-list-item>

          <template v-else>
            <v-list-item :to="{ path: '/profile' }">
              <v-icon class="mr-2">mdi-account-circle</v-icon>
              <span>Account & Settings</span>
            </v-list-item>

            <v-list-item id="drawer-nav-logout" @click="logOut()">
              <v-icon class="mr-2">mdi-logout</v-icon>
              <span>Log Out</span>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <cz-notifications />

    <v-dialog v-model="logInDialog.isActive" width="500">
      <cz-login
        @cancel="logInDialog.isActive = false"
        @logged-in="logInDialog.onLoggedIn"
      ></cz-login>
    </v-dialog>

    <v-dialog v-model="authorizeDialog.isActive" width="650">
      <cz-authorize
        @authorized="authorizeDialog.onAuthorized"
        :repo="authorizeDialog.repo"
      ></cz-authorize>
    </v-dialog>
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css"
      rel="stylesheet"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { setupRouteGuards } from "./router";
import { Subscription } from "rxjs";
import {
  APP_NAME,
  DEFAULT_TOAST_DURATION,
  DISCOVERY_SITE_URL,
} from "./constants";
import { RawLocation } from "vue-router";
import { EnumRepositoryKeys } from "./components/submissions/types";
import { CzNotifications, Notifications } from "@cznethub/cznet-vue-core";
import CzFooter from "@/components/base/cz.footer.vue";
import CzLogin from "@/components/account/cz.login.vue";
import CzAuthorize from "@/components/authorize/cz.authorize.vue";
import User from "@/models/user.model";
import Zenodo from "@/models/zenodo.model";
import HydroShare from "./models/hydroshare.model";
import Submission from "./models/submission.model";
import Repository from "./models/repository.model";
import External from "./models/external.model";
import EarthChem from "./models/earthchem.model";

const INITIAL_DIALOG = {
  title: "",
  content: "",
  confirmText: "",
  cancelText: "",
  isActive: false,
  onConfirm: () => {},
  onCancel: () => {},
};

const INITIAL_SNACKBAR = {
  message: "",
  duration: DEFAULT_TOAST_DURATION,
  position: "center" as "center" | "left" | undefined,
  type: "default" as "default" | "success" | "error" | "info",
  isActive: false,
  isInfinite: false,
  // isPersistent: false,
};

@Component({
  name: "app",
  components: { CzFooter, CzLogin, CzAuthorize, CzNotifications },
})
export default class App extends Vue {
  protected isLoading = true;
  protected onToast!: Subscription;
  protected onOpenDialog!: Subscription;
  protected onOpenLogInDialog!: Subscription;
  protected onOpenAuthorizeDialog!: Subscription;
  protected showMobileNavigation = false;
  protected loggedInSubject = new Subscription();
  // protected authorizedSubject = new Subscription();
  protected isAppBarExtended = true;
  protected snackbarColors = {
    success: { snackbar: "primary", actionButton: "primary darken-2" },
    error: { snackbar: "error darken-2", actionButton: "error darken-3" },
    info: { snackbar: "warning darken-2", actionButton: "warning darken-4" },
    default: { snackbar: undefined, actionButton: undefined },
  };
  protected snackbar: any & { isActive: boolean; isInfinite: boolean } =
    INITIAL_SNACKBAR;
  protected dialog: any & { isActive: boolean } = INITIAL_DIALOG;
  protected logInDialog: any & { isActive: boolean } = {
    isActive: false,
    onLoggedIn: () => {},
    onCancel: () => {},
  };
  protected authorizeDialog: any & { isActive: boolean } = {
    isActive: false,
    repo: "",
    onAuthorized: () => {},
    onCancel: () => {},
  };
  protected paths = [
    {
      attrs: { to: "/submissions" },
      label: "My Submissions",
      icon: "mdi-bookmark-multiple",
      isActive: () => this.$route.name === "view-submission",
    },
    {
      attrs: { to: "/resources" },
      label: "Resources",
      icon: "mdi-library",
    },
    {
      attrs: { to: "/submit" },
      label: "Submit Data",
      icon: "mdi-book-plus",
      isActive: () => this.$route.name === "register",
    },
    {
      attrs: { href: DISCOVERY_SITE_URL },
      label: "Discover Data",
      icon: "mdi-card-search",
      isExternal: true,
    },
    { attrs: { to: "/about" }, label: "About", icon: "mdi-help" },
    {
      attrs: { to: "/contact" },
      label: "Contact",
      icon: "mdi-book-open-blank-variant",
    },
  ];

  protected get isLoggedIn(): boolean {
    return User.$state.isLoggedIn;
  }

  protected get isSafari(): boolean {
    return this.$browserDetect.isSafari;
  }

  mounted() {
    this.$watch("$refs.appBar.computedHeight", (newValue, oldValue) => {
      this.isAppBarExtended = newValue > oldValue;
    });
  }

  protected openLogInDialog() {
    User.openLogInDialog();
  }

  protected logOut() {
    Notifications.openDialog({
      title: "Log out?",
      content: "Are you sure you want to log out?",
      confirmText: "Log Out",
      cancelText: "Cancel",
      onConfirm: () => {
        User.logOut();
      },
    });
  }

  /** Check if the user is still logged in after being idle for a while */
  @Watch("isAppIdle")
  onIdleChange(wasActive, isActive) {
    if (isActive) {
      User.checkAuthorization();
    }
  }

  async created() {
    document.title = APP_NAME;

    if (this.$route.name !== "submissions") {
      // Only load submissions on app start if outside submissions page. Otherwise the submissions page will load them on 'created' lifecyecle hook
      Submission.fetchSubmissions();
    }

    this.onToast = Notifications.toast$.subscribe((toast) => {
      this.snackbar = { ...this.snackbar, ...toast };
      this.snackbar.isActive = true;
    });

    this.onOpenDialog = Notifications.dialog$.subscribe((dialog) => {
      this.dialog = { ...INITIAL_DIALOG, ...dialog };
      this.dialog.isActive = true;
    });

    this.onOpenLogInDialog = User.logInDialog$.subscribe(
      (redirectTo: RawLocation | undefined) => {
        this.logInDialog.isActive = true;

        this.logInDialog.onLoggedIn = () => {
          if (redirectTo) {
            this.$router.push(redirectTo).catch(() => {});
          }
          this.logInDialog.isActive = false;
        };
      }
    );

    this.onOpenAuthorizeDialog = Repository.authorizeDialog$.subscribe(
      (params: {
        repository: string;
        redirectTo?: RawLocation | undefined;
      }) => {
        this.authorizeDialog.repo = params.repository;
        this.authorizeDialog.isActive = true;
        this.authorizeDialog.onAuthorized = async () => {
          if (params.redirectTo) {
            if (params.repository === EnumRepositoryKeys.hydroshare) {
              await HydroShare.init();
            } else if (params.repository === EnumRepositoryKeys.zenodo) {
              await Zenodo.init();
            } else if (params.repository === EnumRepositoryKeys.earthchem) {
              await EarthChem.init();
            }
            this.$router.push(params.redirectTo).catch(() => {});
          }
          this.authorizeDialog.isActive = false;
        };
      }
    );

    // Check for Authorization cookie instead.
    // const isAuthorized = this.$cookies.get('Authorization')

    // TODO: if the user is not logged in in the server, the client auth cookie needs to be deleted
    // Reproducible if the server is restarted

    // if (isAuthorized && !User.$state.isLoggedIn) {
    await User.checkAuthorization();
    // }

    if (User.$state.isLoggedIn) {
      await this._initRepositories();
    } else {
      this.loggedInSubject = User.loggedIn$.subscribe(async () => {
        await this._initRepositories();
      });
    }

    // this.authorizedSubject = Repository.authorized$.subscribe(async (repository: string) => {
    //   if (repository === EnumRepositoryKeys.hydroshare) {
    //     await HydroShare.init()
    //   }
    //   else if (repository === EnumRepositoryKeys.zenodo) {
    //     await Zenodo.init()
    //   }
    // })

    // Guards are setup after checking authorization and loading access tokens
    // because they depend on user logged in status
    setupRouteGuards();

    this.isLoading = false;
  }

  private _initRepositories() {
    return Promise.all([
      HydroShare.init(),
      EarthChem.init(),
      Zenodo.init(),
      External.init(),
    ]);
  }

  beforeDestroy() {
    // Good practice
    this.onToast.unsubscribe();
    this.onOpenDialog.unsubscribe();
    this.onOpenLogInDialog.unsubscribe();
    this.onOpenAuthorizeDialog.unsubscribe();
    this.loggedInSubject.unsubscribe();
  }
}
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
