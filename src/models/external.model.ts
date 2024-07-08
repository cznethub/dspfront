import Repository from './repository.model'
import { EnumRepositoryKeys } from '~/components/submissions/types'

export default class External extends Repository {
  static entity = EnumRepositoryKeys.external
  static baseEntity = 'repository'

  static state() {
    return {
      ...super.state(),
    }
  }
}
