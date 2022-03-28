import { RouteConfig } from "vue-router"

import CzFooter from '@/components/base/cz.footer.vue'
import CzHome from '@/components/home/cz.home.vue'
import CzAbout from '@/components/about/cz.about.vue'
import CzSubmit from '@/components/submit/cz.submit.vue'
import CzResources from '@/components/resources/cz.resources.vue'
import CzContact from '@/components/contact/cz.contact.vue'
import CzRecommendations from '@/components/recommendations/cz.recommendations.vue'
import CzRecomendationsQuestionaire from '@/components/recommendations/cz.recommendations-questionaire.vue'
import CzSubmissions from '@/components/submissions/cz.submissions.vue'
import CzNewSubmission from '@/components/new-submission/cz.new-submission.vue'

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
    name: 'about',
    path: '/about',
    components: {
      content: CzAbout,
      footer: CzFooter
    },
  },
  {
    name: 'resources',
    path: '/resources',
    components: {
      content: CzResources,
      footer: CzFooter
    },
  },
  {
    name: 'recommendations',
    path: '/resources/recommendations',
    components: {
      content: CzRecommendations,
      footer: CzFooter
    },
  },
  {
    name: 'recommendations-questionaire',
    path: '/resources/recommendations-questionaire',
    components: {
      content: CzRecomendationsQuestionaire,
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
    meta: { hasLoggedInGuard: true },
  },
  {
    name: 'submit',
    path: '/submit',
    components: {
      content: CzSubmit,
      footer: CzFooter
    },
    children: [
      {
        name: 'submit.repository',
        path: ':repository/:id?',
        components: {
          default: CzNewSubmission,
        },
        meta: { hasLoggedInGuard: true, hasAccessTokenGuard: true, hasUnsavedChangesGuard: true }
      },
    ]
  },
  {
    name: 'contact',
    path: '/contact',
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
