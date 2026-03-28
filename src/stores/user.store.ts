import type { RouteLocationRaw } from 'vue-router'
import type { ISubmission } from '~/components/submissions/types'
import { Notifications } from '@cznethub/cznet-vue-core'
import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { Subject } from 'rxjs'
import { API_BASE, APP_URL } from '~/constants'

const STORAGE_KEY = 'cz-hub-user'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const isLoggedIn = shallowRef(false)
  const orcid = shallowRef('')
  const orcidAccessToken = shallowRef('')
  const next = shallowRef('')
  const hasUnsavedChanges = shallowRef(false)
  const isSaving = shallowRef(false)
  const registeringSubmission = shallowRef<Partial<ISubmission> | null>(null)
  const showSubmissionWarning = shallowRef(true)

  // --- Computed ---
  const accessToken = computed(() => orcidAccessToken.value)
  const isAuthenticated = computed(() => isLoggedIn.value)

  // --- RxJS Subjects (cross-component events) ---
  const logInDialog$ = new Subject<RouteLocationRaw | undefined>()
  const loggedIn$ = new Subject<void>()

  // --- Internal ---
  let controller = new AbortController()

  // --- Actions ---
  function openLogInDialog(redirectTo?: RouteLocationRaw) {
    logInDialog$.next(redirectTo)
  }

  async function logIn(callback?: () => any) {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== APP_URL || !Object.prototype.hasOwnProperty.call(event.data, 'token')) {
        return
      }

      if (event.data.token) {
        Notifications.toast({
          message: 'You have logged in!',
          type: 'info',
        })
        isLoggedIn.value = true
        orcid.value = event.data.orcid
        orcidAccessToken.value = event.data.token
        document.cookie = `Authorization=Bearer ${event.data.token}; expires=${event.data.expiresIn}; path=/`
        controller.abort()
        loggedIn$.next()
        callback?.()
      }
      else {
        Notifications.toast({
          message: 'Failed to Log In',
          type: 'error',
        })
      }
    }

    window.open(
      `${API_BASE}/login?window_close=True`,
      '_blank',
      'location=1,status=1,scrollbars=1, width=800,height=800',
    )

    controller.abort()
    controller = new AbortController()
    window.addEventListener('message', handleMessage, {
      signal: controller.signal,
    })
    console.info(`[User]: Listening to login window...`)
  }

  async function checkAuthorization() {
    try {
      const response = await axios.get('/api', {
        params: { access_token: orcidAccessToken.value },
      })

      if (response.status !== 200) {
        isLoggedIn.value = false
      }
    }
    catch {
      isLoggedIn.value = false
    }
  }

  async function logOut() {
    try {
      await axios.get('/api/logout')
      _logOut()
    }
    catch {
      _logOut()
    }
  }

  function _logOut() {
    isLoggedIn.value = false
    orcidAccessToken.value = ''

    Notifications.toast({
      message: 'You have logged out!',
      type: 'info',
    })
  }

  // --- Persistence (manual localStorage) ---
  function _loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        isLoggedIn.value = data.isLoggedIn ?? false
        orcid.value = data.orcid ?? ''
        orcidAccessToken.value = data.orcidAccessToken ?? ''
        next.value = data.next ?? ''
        hasUnsavedChanges.value = data.hasUnsavedChanges ?? false
        isSaving.value = data.isSaving ?? false
        registeringSubmission.value = data.registeringSubmission ?? null
        showSubmissionWarning.value = data.showSubmissionWarning ?? true
      }
    }
    catch {
      // Ignore corrupted storage
    }
  }

  function _persistState() {
    const data = {
      isLoggedIn: isLoggedIn.value,
      orcid: orcid.value,
      orcidAccessToken: orcidAccessToken.value,
      next: next.value,
      hasUnsavedChanges: hasUnsavedChanges.value,
      isSaving: isSaving.value,
      registeringSubmission: registeringSubmission.value,
      showSubmissionWarning: showSubmissionWarning.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // Load persisted state on creation
  _loadPersistedState()

  // Watch all state for persistence via $subscribe (handled by Pinia)
  // We use a Pinia plugin approach via the store's $subscribe

  return {
    // State
    isLoggedIn,
    orcid,
    orcidAccessToken,
    next,
    hasUnsavedChanges,
    isSaving,
    registeringSubmission,
    showSubmissionWarning,

    // Computed
    accessToken,
    isAuthenticated,

    // RxJS Subjects
    logInDialog$,
    loggedIn$,

    // Actions
    openLogInDialog,
    logIn,
    checkAuthorization,
    logOut,

    // Persistence (internal, exposed for $subscribe)
    _persistState,
  }
})

// Pinia plugin for auto-persisting user store
export function piniaUserPersistPlugin({ store }: { store: any }) {
  if (store.$id === 'user') {
    store.$subscribe(() => {
      store._persistState()
    })
  }
}
