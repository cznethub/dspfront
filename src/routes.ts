import type { RouteRecordRaw } from 'vue-router'
import { hasAccessTokenGuard, hasLoggedInGuard, hasUnsavedChangesGuard } from './guards'
import CzFooter from '~/components/base/cz.footer.vue'
import CzHome from '~/components/home/cz.home.vue'
import CzAbout from '~/components/about/cz.about.vue'
import CzQuickStartGuide from '~/components/quick-start-guide/cz.quick-start-guide.vue'
import CzSubmit from '~/components/submit/cz.submit.vue'
import CzResources from '~/components/resources/cz.resources.vue'
import CzContact from '~/components/contact/cz.contact.vue'
import CzRecomendationsQuestionnaire from '~/components/recommendations/cz.recommendations-questionnaire.vue'
import CzProfile from '~/components/profile/cz.profile.vue'
import CzAccount from '~/components/profile/cz.account.vue'
import CzAuthorizedRepositories from '~/components/profile/cz.authorized-repositories.vue'
import CzSubmissions from '~/components/submissions/cz.submissions.vue'

import CzNewSubmission from '~/components/new-submission/cz.new-submission.vue'

// import CzViewSubmission from "~/components/view-submission/cz.view-submission.vue";
import CzRegisterDataset from '~/components/register-dataset/cz.register-dataset.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'home',
    path: '/',
    components: {
      content: CzHome,
      footer: CzFooter,
    },
  },
  {
    name: 'profile',
    path: '/profile',
    redirect: '/profile/account',
    components: {
      content: CzProfile,
      footer: CzFooter,
    },
    beforeEnter: [hasLoggedInGuard],
    children: [
      {
        name: 'profile.account',
        path: 'account',
        components: {
          CzAccount,
        },
        beforeEnter: [hasLoggedInGuard],
      },
      {
        name: 'profile.authorized-repositories',
        path: 'authorized-repositories',
        components: {
          CzAuthorizedRepositories,
        },
        beforeEnter: [hasLoggedInGuard],
      },
    ],
  },
  {
    name: 'about',
    path: '/about',
    meta: {
      title: 'About',
    },
    components: {
      content: CzAbout,
      footer: CzFooter,
    },
  },
  {
    name: 'resources',
    path: '/resources',
    meta: {
      title: 'Resources',
    },
    components: {
      content: CzResources,
      footer: CzFooter,
    },
  },
  {
    name: 'recommendations',
    path: '/resources/recommendations',
    components: {
      content: CzRecomendationsQuestionnaire,
      footer: CzFooter,
    },
    meta: {
      title: 'Repository Recommendations',
    },
  },
  {
    name: 'quick-start-guide',
    path: '/resources/quick-start-guide',
    meta: {
      title: 'Quick Start Guide',
    },
    components: {
      content: CzQuickStartGuide,
      footer: CzFooter,
    },
  },
  {
    name: 'submissions',
    path: '/submissions',
    components: {
      content: CzSubmissions,
      footer: CzFooter,
    },
    beforeEnter: [hasLoggedInGuard],
    meta: {
      title: 'My Submissions',
    },
  },
  {
    name: 'register',
    path: '/register',
    components: {
      content: CzRegisterDataset,
      footer: CzFooter,
    },
    beforeEnter: [hasLoggedInGuard, hasAccessTokenGuard],
    meta: {
      title: 'Register Dataset',
    },
  },
  {
    name: 'submit',
    path: '/submit',
    components: {
      content: CzSubmit,
      footer: CzFooter,
    },
    meta: {
      title: 'Submit Data',
      metaTags: [
        {
          name: 'keywords',
          content: 'HydroShare, EarthChem, Zenodo, Submit, Data, Repositories',
        },
      ],
    },
    children: [
      {
        name: 'submit.repository',
        path: ':repository/:id?',
        components: {
          default: CzNewSubmission,
        },
        beforeEnter: [hasLoggedInGuard, hasAccessTokenGuard, hasUnsavedChangesGuard],
      },
    ],
  },
  // {
  //   name: "view-submission",
  //   path: "/submission/:repository/:id",
  //   components: {
  //     content: CzViewSubmission,
  //     footer: CzFooter,
  //   },
  //   meta: {
  //     hasLoggedInGuard: true,
  //     hasAccessTokenGuard: true,
  //     title: "View Submission", // TODO: use dataset title if possible
  //   },
  // },
  {
    name: 'contact',
    path: '/contact',
    meta: {
      title: 'How to Contact Us',
    },
    components: {
      content: CzContact,
      footer: CzFooter,
    },

  },
  /** @see https://router.vuejs.org/guide/migration/#removed-star-or-catch-all-routes */
  { path: '/:pathMatch(.*)*', name: 'not-found', component: CzHome },
  { path: '/:pathMatch(.*)', name: 'bad-not-found', component: CzHome },
]
