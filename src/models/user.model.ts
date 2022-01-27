import { router } from '@/router'
import { Model } from '@vuex-orm/core'
import { Subject } from 'rxjs'
import { RawLocation } from 'vue-router'
import axios from "axios"
import CzNotification from './notifications.model'

export interface ICzCurrentUserState {
  orcid: string
  orcidAccessToken: string
}

export interface IUserState {
  isLoggedIn: boolean
  orcid: string
  orcidAccessToken: string
  next: string
}

export default class User extends Model {
  static entity = 'users'
  static isLoginListenerSet = false
  static logInDialog$ = new Subject<RawLocation | undefined>()
  static loggedIn$ = new Subject<void>()
  
  static fields () {
    return {}
  }

  static get $state(): IUserState {
    return this.store().state.entities[this.entity]
  }

  static get next() {
    return 
  }

  static get accessToken() {
    return this.$state?.orcidAccessToken
  }

  static state(): IUserState {
    return {
      isLoggedIn: false,
      orcid: '',
      orcidAccessToken: '',
      next: ''
    }
  }

  static openLogInDialog(redirectTo?: RawLocation) {
    this.logInDialog$.next(redirectTo)
  }

  static async logIn(callback?: () => any) {
    window.open(
      `${window.location.origin}/api/login`,
      "_blank",
      "location=1,status=1,scrollbars=1, width=800,height=800"
    )

    if (!this.isLoginListenerSet) {
      window.addEventListener("message", async (message) => {
        this.isLoginListenerSet = true; // Prevents registering the listener more than once

        if (message.data.token) {
          CzNotification.toast({ 
            message: 'You have logged in!', 
          })
          await User.commit((state) => {
            state.isLoggedIn = true
            state.orcid = message.data.orcid
            state.orcidAccessToken = message.data.token
          })
          document.cookie = `Authorization=Bearer ${message.data.token}; expires=${message.data.expiresIn}; path=/`
          this.loggedIn$.next()
          if (callback) {
            callback()
          }
        }
        else {
          CzNotification.toast({ message: 'Failed to Log In' })
        }
      })
    }
  }

  static async checkAuthorization() {
    try {
      const response = await axios.get('/api', { 
        params: { "access_token": User.$state.orcidAccessToken }
      })
      
      if (response.status !== 200) {
        // Something went wrong, authorization may be invalid
        User.commit((state) => {
          state.isLoggedIn = false
        })
      }
    }
    catch(e: any) {
      // console.log(e.response.status)
      User.commit((state) => {
        state.isLoggedIn = false
      })
    }
  }

  static async logOut() {
    try {
      await axios.get('/api/logout')  // We don't care about the response status. We at least log the user out in the frontend.
      await User.commit((state) => {
        state.isLoggedIn = false,
        // state.orcid = ''
        state.orcidAccessToken = ''
      })

      CzNotification.toast({ 
        message: 'You have logged out!', 
      })

      if (router.currentRoute.meta?.hasLoggedInGuard) {
        router.push({ path: '/' })
      }
    }
    catch(e) {
      console.error("Failed to log out", e)
    }
  }
}