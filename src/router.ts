import { routes } from "./routes";
import { APP_NAME } from "./constants";
import { isRepositoryAuthorized } from "./util";
import { Notifications } from "@cznethub/cznet-vue-core";
import VueRouter, { RawLocation } from "vue-router";
import User from "./models/user.model";
import Repository from "./models/repository.model";

export const router = new VueRouter({
  mode: "history",
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    document.getElementsByTagName("html")[0]?.scrollTo({ left: 0, top: 0 });
  },
});

/** Guards are executed in the order they appear in this array */
const guards: ((to, from?, next?) => RawLocation | null)[] = [
  // hasNextRouteGuard
  (_to, _from?): RawLocation | null => {
    const nextRoute = User.$state.next;
    if (nextRoute) {
      // Consume the redirect
      User.commit((state) => {
        state.next = "";
      });
      return { path: nextRoute };
    }

    return null;
  },

  // hasLoggedInGuard
  (to, from?, _next?): RawLocation | null => {
    if (to.meta?.hasLoggedInGuard && !User.$state.isLoggedIn) {
      User.openLogInDialog({ path: to.path });
      return from;
    }

    return null;
  },

  // hasAccessTokenGuard
  (to, from?): RawLocation | null => {
    if (to.meta?.hasAccessTokenGuard) {
      if (!isRepositoryAuthorized(to.params.repository, false)) {
        Repository.openAuthorizeDialog(to.params.repository, { path: to.path });
        return from;
      }
    }

    return null;
  },

  // hasUnsavedChangesGuard
  (to, from?, _next?): RawLocation | null => {
    if (
      from &&
      from.meta?.hasUnsavedChangesGuard &&
      User.$state.hasUnsavedChanges
    ) {
      Notifications.openDialog({
        title: "You have unsaved changes",
        content: "Do you want to continue and discard your changes?",
        confirmText: "Discard",
        cancelText: "Cancel",
        onConfirm: async () => {
          User.commit((state) => {
            state.hasUnsavedChanges = false;
          });
          router.push(to);
        },
      });
      return from;
    }

    return null;
  },

  // https://www.digitalocean.com/community/tutorials/vuejs-vue-router-modify-head
  // Append head tags and update page title
  (to, from, _next) => {
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    const nearestWithTitle = to.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.title);

    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.metaTags);

    const previousNearestWithMeta = from?.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.metaTags);

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) {
      document.title = `${APP_NAME} | ${nearestWithTitle.meta.title}`;
    } else if (previousNearestWithMeta) {
      document.title = previousNearestWithMeta.meta.title;
    } else {
      document.title = APP_NAME;
    }

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map(
      (el) => el.parentNode?.removeChild(el)
    );

    // Skip rendering meta tags if there are none.
    if (!nearestWithMeta) return null;

    // Turn the meta tag definitions into actual elements in the head.
    nearestWithMeta.meta.metaTags
      .map((tagDef) => {
        const tag = document.createElement("meta");

        Object.keys(tagDef).forEach((key) => {
          tag.setAttribute(key, tagDef[key]);
        });

        // We use this to track which meta tags we create so we don't interfere with other ones.
        tag.setAttribute("data-vue-router-controlled", "");

        return tag;
      })
      // Add the meta tags to the document head.
      .forEach((tag) => document.head.appendChild(tag));

    return null;
  },
];

export function setupRouteGuards() {
  router.beforeEach((to, _from, next) => {
    console.log("Router beforeEach: ", to);
    next();
  });

  guards.map((fn: (to, from?, next?) => RawLocation | null) => {
    router.beforeEach((to, from, next) => {
      const activatedRouteGuard = fn(to, from, next);
      if (activatedRouteGuard) {
        next(activatedRouteGuard);
      } else {
        next();
      }
    });
  });

  checkGuardsOnce();
}

/** Call before navigating to an external url to save the next route in state and navigate to it after callback url */
export function saveNextRoute() {
  const next = router.currentRoute.query.next;
  if (next) {
    User.commit((state) => {
      state.next = next;
    });
  }
}

// Call this manually immediately after guards are setup to check guards on the page that loaded on app start.
function checkGuardsOnce() {
  let activatedGuardRoute: RawLocation | null = null;

  for (let i = 0; i < guards.length; i++) {
    const r = guards[i](router.currentRoute);
    if (r) {
      // Some guard activated
      activatedGuardRoute = r;
      break;
    }
  }
  if (activatedGuardRoute) {
    router.push(activatedGuardRoute);
  }
}
