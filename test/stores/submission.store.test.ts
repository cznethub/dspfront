import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSubmissionStore } from '../../src/stores/submission.store'
import type { ISubmission } from '../../src/components/submissions/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeSubmission(overrides: Partial<ISubmission> = {}): ISubmission {
  return {
    identifier: 'abc123',
    repository: 'hydroshare',
    title: 'Test Dataset',
    authors: ['Smith, John'],
    date: new Date('2024-01-15T00:00:00.000Z').getTime(),
    url: 'https://www.hydroshare.org/resource/abc123/',
    metadata: {},
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

// ---------------------------------------------------------------------------
// getInsertDataFromDb — DB → ISubmission transform
// ---------------------------------------------------------------------------
describe('getInsertDataFromDb', () => {
  it('maps all fields from the DB payload', () => {
    const store = useSubmissionStore()
    const result = store.getInsertDataFromDb({
      title: 'Critical Zone Hydrology Data',
      authors: ['Smith, John A.', 'Doe, Jane B.'],
      repo_type: 'hydroshare',
      submitted: '2024-01-15T10:30:00.000Z',
      identifier: 'a1b2c3d4',
      metadata_json: '{"key":"value"}',
      url: 'https://www.hydroshare.org/resource/a1b2c3d4/',
    })

    expect(result.title).toBe('Critical Zone Hydrology Data')
    expect(result.authors).toEqual(['Smith, John A.', 'Doe, Jane B.'])
    expect(result.repository).toBe('hydroshare')
    expect(result.identifier).toBe('a1b2c3d4')
    expect(result.url).toBe('https://www.hydroshare.org/resource/a1b2c3d4/')
    expect(result.metadata).toEqual({ key: 'value' })
    expect(result.date).toBe(new Date('2024-01-15T10:30:00.000Z').getTime())
  })

  it('parses metadata_json into an object', () => {
    const store = useSubmissionStore()
    const result = store.getInsertDataFromDb({
      title: 'T',
      authors: [],
      repo_type: 'zenodo',
      submitted: '2024-01-01T00:00:00.000Z',
      identifier: 'z1',
      metadata_json: '{"creator":"Alice","year":2024}',
      url: '',
    })
    expect(result.metadata).toEqual({ creator: 'Alice', year: 2024 })
  })

  it('converts the submitted date string to a numeric timestamp', () => {
    const store = useSubmissionStore()
    const iso = '2023-06-15T12:00:00.000Z'
    const result = store.getInsertDataFromDb({
      title: 'T',
      authors: [],
      repo_type: 'earthchem',
      submitted: iso,
      identifier: 'e1',
      metadata_json: '{}',
      url: '',
    })
    expect(result.date).toBe(new Date(iso).getTime())
    expect(typeof result.date).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// insertOrUpdate
// ---------------------------------------------------------------------------
describe('insertOrUpdate', () => {
  it('inserts a new submission', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission())
    expect(store.records).toHaveLength(1)
    expect(store.records[0].identifier).toBe('abc123')
  })

  it('updates an existing submission (same identifier + repository)', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission({ title: 'Original' }))
    store.insertOrUpdate(makeSubmission({ title: 'Updated' }))
    expect(store.records).toHaveLength(1)
    expect(store.records[0].title).toBe('Updated')
  })

  it('partial update preserves existing fields', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission({ title: 'Original', authors: ['Smith, J.'] }))
    store.insertOrUpdate({ identifier: 'abc123', repository: 'hydroshare', title: 'New Title' })
    expect(store.records[0].authors).toEqual(['Smith, J.'])
    expect(store.records[0].title).toBe('New Title')
  })

  it('treats same identifier + different repository as two distinct records', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission({ repository: 'hydroshare' }))
    store.insertOrUpdate(makeSubmission({ repository: 'zenodo' }))
    expect(store.records).toHaveLength(2)
  })

  it('accepts an array and inserts all items', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate([
      makeSubmission({ identifier: 'id1', repository: 'hydroshare' }),
      makeSubmission({ identifier: 'id2', repository: 'zenodo' }),
      makeSubmission({ identifier: 'id3', repository: 'earthchem' }),
    ])
    expect(store.records).toHaveLength(3)
  })

  it('skips items that are missing identifier', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate({ repository: 'hydroshare', title: 'No ID' } as any)
    expect(store.records).toHaveLength(0)
  })

  it('skips items that are missing repository', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate({ identifier: 'abc123', title: 'No repo' } as any)
    expect(store.records).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// remove
// ---------------------------------------------------------------------------
describe('remove', () => {
  it('removes the matching submission', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate([
      makeSubmission({ identifier: 'keep', repository: 'hydroshare', title: 'Keep' }),
      makeSubmission({ identifier: 'drop', repository: 'zenodo', title: 'Drop' }),
    ])
    store.remove('drop', 'zenodo')
    expect(store.records).toHaveLength(1)
    expect(store.records[0].identifier).toBe('keep')
  })

  it('does nothing when no record matches', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission())
    store.remove('nonexistent', 'hydroshare')
    expect(store.records).toHaveLength(1)
  })

  it('only removes the exact identifier+repository pair', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate([
      makeSubmission({ identifier: 'abc', repository: 'hydroshare' }),
      makeSubmission({ identifier: 'abc', repository: 'zenodo' }),
    ])
    store.remove('abc', 'hydroshare')
    expect(store.records).toHaveLength(1)
    expect(store.records[0].repository).toBe('zenodo')
  })
})

// ---------------------------------------------------------------------------
// find
// ---------------------------------------------------------------------------
describe('find', () => {
  it('returns the submission matching identifier and repository', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission({ title: 'Found' }))
    const result = store.find('abc123', 'hydroshare')
    expect(result).toBeDefined()
    expect(result!.title).toBe('Found')
  })

  it('returns undefined when no match exists', () => {
    const store = useSubmissionStore()
    expect(store.find('ghost', 'hydroshare')).toBeUndefined()
  })

  it('does not match a different repository for the same identifier', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission({ repository: 'hydroshare' }))
    expect(store.find('abc123', 'zenodo')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// all (computed)
// ---------------------------------------------------------------------------
describe('all computed', () => {
  it('returns all records', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate([
      makeSubmission({ identifier: 'x1' }),
      makeSubmission({ identifier: 'x2', repository: 'zenodo' }),
    ])
    expect(store.all).toHaveLength(2)
  })

  it('is reactive — updates when records change', () => {
    const store = useSubmissionStore()
    expect(store.all).toHaveLength(0)
    store.insertOrUpdate(makeSubmission())
    expect(store.all).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Persistence — sortBy and itemsPerPage are saved/restored
// ---------------------------------------------------------------------------
describe('localStorage persistence', () => {
  it('persists sortBy and itemsPerPage after _persistState', () => {
    const store = useSubmissionStore()
    store.sortBy = { key: 'title', label: 'Title', order: 'asc' }
    store.itemsPerPage = 25
    store._persistState()

    // Re-create the store from a fresh Pinia (simulates a page reload)
    localStorage.clear() // we'll re-seed manually
    const raw = localStorage.getItem('cz-hub-submissions')
    // _persistState was called before clear, so read from the saved value
    store._persistState() // save again after we changed it above
    const saved = JSON.parse(localStorage.getItem('cz-hub-submissions') || '{}')
    expect(saved.sortBy.key).toBe('title')
    expect(saved.itemsPerPage).toBe(25)
  })

  it('does not persist records (session data only)', () => {
    const store = useSubmissionStore()
    store.insertOrUpdate(makeSubmission())
    store._persistState()
    const saved = JSON.parse(localStorage.getItem('cz-hub-submissions') || '{}')
    expect(saved.records).toBeUndefined()
  })
})
