import type {
  EnumRepositoryKeys,
  IRepository,
} from '~/components/submissions/types'
import { Subscription } from 'rxjs'
import { Component, Vue } from 'vue-facing-decorator'
import { useRoute, useRouter } from 'vue-router'
import { getRepositoryFromKey } from '~/constants'
import Repository from '~/models/repository.model'

@Component
export class ActiveRepositoryMixin extends Vue {
  authorizedSubject = new Subscription()
  router = useRouter()

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

    if (repo.isSupported?.form && !repo.isComingSoon) {
      this.setActiveRepository(repo.key)
      this.router
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
