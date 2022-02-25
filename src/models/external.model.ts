
import { EnumRepositoryKeys } from '@/components/submissions/types'
import axios from "axios"
import Repository from './repository.model'

const sprintf = require("sprintf-js").sprintf

export default class External extends Repository {
  static entity = EnumRepositoryKeys.external
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }
}
