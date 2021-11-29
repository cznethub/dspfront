import { router } from '@/router'
import { Model } from '@vuex-orm/core'
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

  static async checkAuthorization() {
    try {
      const response = await axios.get('/api')
      
      if (response.status === 200) {
        if (!User.$state.isLoggedIn) {
          // Just logged in
          CzNotification.toast({ 
            message: 'You have logged in!', 
          })

          await User.commit((state) => {
            state.isLoggedIn = true
            state.orcid = response.data.orcid
            state.orcidAccessToken = response.data.orcid_access_token
          })
        }
      }
      else {
        // Something went wrong, authorization may be invalid
        User.commit((state) => {
          state.isLoggedIn = false
        })
      }
    }
    catch(e) {
      User.commit((state) => {
        state.isLoggedIn = false
      })
    }
  }

  static async logOut() {
    try {
      const response = await axios.get('/api/logout')
      if (response.status === 200) {
        await User.commit((state) => {
          state.isLoggedIn = false
        })

        if (router.currentRoute.meta?.hasLoggedInGuard) {
          router.push({ path: '/' })
        }

        CzNotification.toast({ 
          message: 'You have logged out!', 
        })
      }
    }
    catch(e) {
      console.error("Failed to log out", e)
    }
  }
}