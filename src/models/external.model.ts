
import { EnumRepositoryKeys } from '@/components/submissions/types'
import Repository from './repository.model'

export default class External extends Repository {
  static entity = EnumRepositoryKeys.external
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }
}
