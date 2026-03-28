import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { IRepository, EnumRepositoryKeys } from '~/components/submissions/types'
import { useRepositoryStore } from '~/stores/repository.store'

export function useActiveRepository() {
  const repositoryStore = useRepositoryStore()
  const router = useRouter()

  const activeRepositoryKey = computed(() => repositoryStore.submittingTo)

  function setActiveRepository(key: EnumRepositoryKeys) {
    repositoryStore.submittingTo = key
    repositoryStore._persistState()
  }

  async function openAuthorizePopup(repositoryKey: string) {
    await repositoryStore.authorize(repositoryKey as EnumRepositoryKeys)
  }

  function submitTo(repo: IRepository) {
    if (repo.isDisabled) return

    if (repo.isSupported?.form && !repo.isComingSoon) {
      setActiveRepository(repo.key)
      router.push({ name: 'register-data.repository', params: { repository: repo.key } })
    }
    else {
      window.open(repo.url, '_blank')
    }
  }

  return {
    activeRepositoryKey,
    setActiveRepository,
    openAuthorizePopup,
    submitTo,
  }
}
