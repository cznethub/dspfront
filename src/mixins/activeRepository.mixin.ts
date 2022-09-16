import Vue from 'vue'
import HydroShare from '@/models/hydroshare.model'
import Zenodo from '@/models/zenodo.model'
import Repository from '@/models/repository.model'
import External from '@/models/external.model'
import EarthChem from '@/models/earthchem.model'
import { Component } from 'vue-property-decorator'
import { EnumRepositoryKeys, IRepository } from '@/components/submissions/types'
import { Subscription } from "rxjs"

@Component
export class ActiveRepositoryMixin extends Vue {
  protected authorizedSubject = new Subscription()

  protected get activeRepository() {
    const key = Repository.$state.submittingTo
    return this.getRepositoryFromKey(key) as typeof Repository
  }

  protected getRepositoryFromKey(key: string): typeof Repository | undefined {
    switch (key) {
      case EnumRepositoryKeys.hydroshare: return HydroShare
      case EnumRepositoryKeys.zenodo: return Zenodo
      case EnumRepositoryKeys.earthchem: return EarthChem
      case EnumRepositoryKeys.external: return External
    }
  }

  protected async openAuthorizePopup(repositoryKey: string) {
    const repository = this.getRepositoryFromKey(repositoryKey) as typeof Repository
    Repository.authorize(repository)  // We don't need to provide a callback because we already have a subject set
  }

  protected setActiveRepository(key: EnumRepositoryKeys) {
    Repository.commit((state) => {
      state.submittingTo = key;
    })
  }

  protected submitTo(repo: IRepository) {
    if (repo.isDisabled) {
      return
    }

    if (repo.isSupported && !repo.isComingSoon) {
      this.setActiveRepository(repo.key)
      this.$router.push({ name: 'submit.repository', params: { repository: repo.key } })
      .catch(() => {})
    }
    else {
      window.open(repo.url, '_blank')
    }
  }

  beforeDestroy() {
    this.authorizedSubject.unsubscribe()
  }
}
