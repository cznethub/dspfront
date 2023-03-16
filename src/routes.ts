import { RouteConfig } from "vue-router"

import CzFooter from '@/components/base/cz.footer.vue'
import CzHome from '@/components/home/cz.home.vue'
import CzAbout from '@/components/about/cz.about.vue'
import CzQuickStartGuide from '@/components/quick-start-guide/cz.quick-start-guide.vue'
import CzSubmit from '@/components/submit/cz.submit.vue'
import CzResources from '@/components/resources/cz.resources.vue'
import CzContact from '@/components/contact/cz.contact.vue'
import CzRecomendationsQuestionnaire from '@/components/recommendations/cz.recommendations-questionnaire.vue'
import CzProfile from '@/components/profile/cz.profile.vue'
import CzAccount from '@/components/profile/cz.account.vue'
import CzAuthorizedRepositories from '@/components/profile/cz.authorized-repositories.vue'
import CzSubmissions from '@/components/submissions/cz.submissions.vue'
import CzNewSubmission from '@/components/new-submission/cz.new-submission.vue'
import CzRegisterDataset from '@/components/register-dataset/cz.register-dataset.vue'

export const routes: RouteConfig[] = [
  {
    name: 'home',
    path: '/',
    components: {
      content: CzHome,
      footer: CzFooter
    },
  },
  {
    name: 'profile',
    path: '/profile',
    redirect: '/profile/account',
    components: {
      content: CzProfile,
      footer: CzFooter
    },
    meta: { 
      hasLoggedInGuard: true,
    },
    children: [
      {
        name: 'profile.account',
        path: 'account',
        components: {
          CzAccount
        },
        meta: { 
          hasLoggedInGuard: true,
        },
      },
      {
        name: 'profile.authorized-repositories',
        path: 'authorized-repositories',
        components: {
          CzAuthorizedRepositories
        },
        meta: { 
          hasLoggedInGuard: true,
        },
      }
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
      footer: CzFooter
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
      footer: CzFooter
    },
  },
  {
    name: 'recommendations',
    path: '/resources/recommendations',
    components: {
      content: CzRecomendationsQuestionnaire,
      footer: CzFooter
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
      footer: CzFooter
    },
  },
  {
    name: 'submissions',
    path: '/submissions',
    components: {
      content: CzSubmissions,
      footer: CzFooter
    },
    meta: { 
      hasLoggedInGuard: true,
      title: 'My Submissions',
    },
  },
  {
    name: 'register',
    path: '/register',
    components: {
      content: CzRegisterDataset,
      footer: CzFooter
    },
    meta: { 
      hasLoggedInGuard: true, 
      // hasAccessTokenGuard: true,
      title: 'Register Dataset'
    }
  },
  {
    name: 'submit',
    path: '/submit',
    components: {
      content: CzSubmit,
      footer: CzFooter
    },
    meta: {
      title: 'Submit Data',
      metaTags: [
        {
          name: "keywords",
          content: 'HydroShare, EarthChem, Zenodo, Submit, Data, Repositories'
        }
      ],
    },
    children: [
      {
        name: 'submit.repository',
        path: ':repository/:id?',
        components: {
          default: CzNewSubmission,
        },
        meta: { 
          hasLoggedInGuard: true, 
          hasAccessTokenGuard: true, 
          hasUnsavedChangesGuard: true,
        }
      },
    ]
  },
  {
    name: 'contact',
    path: '/contact',
    meta: { 
      title: 'How to Contact Us',
    },
    components: {
      content: CzContact,
      footer: CzFooter
    },
  },
  {
    path: '*',
    redirect: '/',
  },
]
