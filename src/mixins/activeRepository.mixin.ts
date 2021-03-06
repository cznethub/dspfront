import { Component } from 'vue-property-decorator'
import { EnumRepositoryKeys, IRepository } from '@/components/submissions/types'
import Vue from 'vue'
import HydroShare from '@/models/hydroshare.model'
import Zenodo from '@/models/zenodo.model'
import Repository from '@/models/repository.model'
import External from '@/models/external.model'
import EarthChem from '@/models/earthchem.model'

@Component
export class ActiveRepositoryMixin extends Vue {
  protected get activeRepository() {
    const key = Repository.$state.submittingTo
    return this.getRepositoryFromKey(key) as typeof Repository
  }

  protected getRepositoryFromKey(key: string) {
    switch (key) {
      case EnumRepositoryKeys.hydroshare: return HydroShare
      case EnumRepositoryKeys.zenodo: return Zenodo
      case EnumRepositoryKeys.earthchem: return EarthChem
      case EnumRepositoryKeys.external: return External
    }
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
}
