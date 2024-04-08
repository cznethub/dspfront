import { Component, Vue } from 'vue-facing-decorator'
import { Subscription } from 'rxjs'
import Repository from '~/models/repository.model'
import type {
  EnumRepositoryKeys,
  IRepository,
} from '~/components/submissions/types'
import { getRepositoryFromKey } from '~/constants'

@Component
export class ActiveRepositoryMixin extends Vue {
  authorizedSubject = new Subscription()

  get activeRepository() {
    const key = Repository.$state.submittingTo
    return getRepositoryFromKey(key) as typeof Repository
  }

  async openAuthorizePopup(repositoryKey: string) {
    const repository = getRepositoryFromKey(repositoryKey) as typeof Repository
    Repository.authorize(repository) // We don't need to provide a callback because we already have a subject set
  }

  setActiveRepository(key: EnumRepositoryKeys) {
    Repository.commit((state) => {
      state.submittingTo = key
    })
  }

  submitTo(repo: IRepository) {
    if (repo.isDisabled)
      return

    if (repo.isSupported && !repo.isComingSoon) {
      this.setActiveRepository(repo.key)
      this.$router
        .push({ name: 'submit.repository', params: { repository: repo.key } })
    }
    else {
      window.open(repo.url, '_blank')
    }
  }

  beforeDestroy() {
    this.authorizedSubject.unsubscribe()
  }
}
