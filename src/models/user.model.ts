import { Model } from '@vuex-orm/core'
import axios from "axios"

export interface ICzCurrentUserState {
  orcid: string
  orcidAccessToken: string
}

export default class User extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'users'
  // static readonly persistInIndexedDB = true

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields () {
    return {}
  }

  static get isLoggedIn() {
    return !!(this.store().state.entities[this.entity]?.isLoggedIn)
  }

  static get accessToken() {
    return this.store().state.entities[this.entity]?.orcidAccessToken
  }

  static state() {
    return {
      isLoggedIn: false,
      orcid: '',
      orcidAccessToken: '',
    }
  }

  static async checkAuthorization() {
    try {
      const response = await axios.get("/api")
      if (response.status === 200) {
        await User.commit((state) => {
          state.isLoggedIn = true
          state.orcid = response.data.orcid
          state.orcidAccessToken = response.data.orcid_access_token
        })
      }
      else {
        User.commit((state) => {
          state.isLoggedIn = false
        })
      }
    }
    catch(e) {
      // console.error(e)
      User.commit((state) => {
        state.isLoggedIn = false
      })
    }
  }

  static async logOut() {
    try {
      const response = await axios.get("/api/logout")
      if (response.status === 200) {
        await User.commit((state) => {
          state.isLoggedIn = false
        })
      }
    }
    catch(e) {
      console.error("Failed to log out", e)
    }
  }
}