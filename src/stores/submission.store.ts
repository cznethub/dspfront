import type { ISubmission } from '~/components/submissions/types'
import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { sprintf } from 'sprintf-js'
import { itemsPerPageArray } from '~/components/submissions/constants'
import { EnumRepositoryKeys, EnumSubmissionSorts } from '~/components/submissions/types'
import { useUserStore } from './user.store'
// This import creates a circular dep at module level, but Pinia stores are lazy singletons
// so calling useRepositoryStore() inside function bodies is safe at runtime
import { useRepositoryStore } from './repository.store'

const STORAGE_KEY = 'cz-hub-submissions'

export const useSubmissionStore = defineStore('submissions', () => {
  const userStore = useUserStore()

  // --- UI State (persisted) ---
  const sortBy = ref<{ key: string, label: string, order: 'asc' | 'desc' }>({
    key: 'date',
    label: EnumSubmissionSorts.date,
    order: 'desc',
  })
  const itemsPerPage = ref<number>(itemsPerPageArray[0])

  // --- Async state ---
  const isFetching = ref(false)

  // --- Record store (not persisted — fetched fresh each session) ---
  const records = ref<ISubmission[]>([])

  // --- Computed ---
  const all = computed(() => records.value)

  // --- Queries ---
  function find(identifier: string, repository: string): ISubmission | undefined {
    return records.value.find(s => s.identifier === identifier && s.repository === repository)
  }

  // --- Mutations ---
  function insertOrUpdate(data: Partial<ISubmission> | Partial<ISubmission>[]) {
    const items = Array.isArray(data) ? data : [data]
    for (const item of items) {
      if (!item.identifier || !item.repository) continue
      const idx = records.value.findIndex(
        s => s.identifier === item.identifier && s.repository === item.repository,
      )
      if (idx >= 0) {
        records.value[idx] = { ...records.value[idx], ...item } as ISubmission
      }
      else {
        records.value.push(item as ISubmission)
      }
    }
  }

  function remove(identifier: string, repository: string) {
    records.value = records.value.filter(
      s => !(s.identifier === identifier && s.repository === repository),
    )
  }

  // --- Data transformers (moved from Submission model) ---
  function getInsertDataFromDb(dbSubmission: any): Partial<ISubmission> {
    return {
      title: dbSubmission.title,
      authors: dbSubmission.authors,
      repository: dbSubmission.repo_type,
      date: new Date(dbSubmission.submitted).getTime(),
      identifier: dbSubmission.identifier,
      metadata: JSON.parse(dbSubmission.metadata_json),
      url: dbSubmission.url,
    }
  }

  function getInsertData(
    apiSubmission: any,
    repository: EnumRepositoryKeys,
    identifier: string,
    overrideDate?: boolean,
    isPublished?: boolean,
  ): Partial<ISubmission> {
    const repoStore = useRepositoryStore()
    const repoData = repoStore.getData(repository)
    let viewUrl = sprintf(repoData?.urls?.viewUrl || '', identifier)

    if (repository === EnumRepositoryKeys.hydroshare) {
      const data: Partial<ISubmission> = {
        title: apiSubmission.title,
        authors: apiSubmission.creators.map((c: any) => c.name || c.organization),
        repository,
        identifier,
        url: viewUrl,
      }
      if (overrideDate) data.date = new Date(apiSubmission.created).getTime()
      return data
    }
    else if (repository === EnumRepositoryKeys.zenodo) {
      if (isPublished) viewUrl = sprintf(repoData?.urls?.publicViewUrl || '', identifier)
      const data: Partial<ISubmission> = {
        title: apiSubmission.title,
        authors: apiSubmission.creators?.map((c: any) => c.name),
        repository,
        identifier,
        url: viewUrl,
      }
      if (overrideDate) {
        const date = apiSubmission.publication_date.split('-')
        data.date = new Date(Date.UTC(+date[0], +date[1] - 1, +date[2])).getTime()
      }
      return data
    }
    else if (repository === EnumRepositoryKeys.earthchem) {
      if (apiSubmission.status === 'published')
        viewUrl = sprintf(repoData?.urls?.publicViewUrl || '', identifier)
      const data: Partial<ISubmission> = {
        title: apiSubmission.title,
        authors: [apiSubmission.leadAuthor, ...apiSubmission.contributors].map(
          (a: any) => `${a.familyName}, ${a.givenName}`,
        ),
        repository,
        identifier,
        url: viewUrl,
      }
      if (overrideDate) {
        const date = apiSubmission.datePublished.split('-')
        data.date = new Date(Date.UTC(+date[0], +date[1] - 1, +date[2])).getTime()
      }
      return data
    }

    return {
      title: apiSubmission.title,
      authors: apiSubmission.authors,
      repository: apiSubmission.repo_type,
      date: new Date(apiSubmission.submitted).getTime(),
      identifier: apiSubmission.identifier,
      metadata: {},
    }
  }

  // --- Async actions ---
  async function fetchSubmissions() {
    console.log('[Submission]: Fetching submissions...')
    try {
      isFetching.value = true
      const response = await axios.get('/api/submissions', {
        params: { access_token: userStore.orcidAccessToken },
      })

      if (response.status === 200) {
        const data = (response.data as any[]).map(getInsertDataFromDb)
        insertOrUpdate(data)
      }
      else if (response.status === 401) {
        userStore.logOut()
      }

      isFetching.value = false
      return response.status
    }
    catch (e: any) {
      isFetching.value = false
      return e.response?.status
    }
  }

  // --- Persistence ---
  function _loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.sortBy) sortBy.value = data.sortBy
        if (data.itemsPerPage !== undefined) itemsPerPage.value = data.itemsPerPage
      }
    }
    catch {
      // Ignore corrupted storage
    }
  }

  function _persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sortBy: sortBy.value,
      itemsPerPage: itemsPerPage.value,
    }))
  }

  _loadPersistedState()

  return {
    // State
    sortBy,
    itemsPerPage,
    isFetching,
    records,

    // Computed
    all,

    // Queries
    find,

    // Mutations
    insertOrUpdate,
    remove,

    // Transformers
    getInsertDataFromDb,
    getInsertData,

    // Actions
    fetchSubmissions,

    // Persistence
    _persistState,
  }
})

export function piniaSubmissionPersistPlugin({ store }: { store: any }) {
  if (store.$id === 'submissions') {
    store.$subscribe(() => {
      store._persistState()
    })
  }
}
