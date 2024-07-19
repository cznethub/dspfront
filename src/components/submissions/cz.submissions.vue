<template>
  <div class="cz-submissions">
    <div class="cz-submissions--header">
      <div class="text-h4">
        My Submissions
      </div>
      <v-divider class="mb-4" />
      <div>
        <div class="d-flex align-md-center flex-column flex-md-row gap-1">
          <div
            v-if="!isFetching && submissions.length"
            class="d-flex flex-column flex-md-row flex-grow-1"
          >
            <v-text-field
              id="my_submissions_search"
              v-model="filters.searchStr"
              class="ma-1 my-2 my-md-0"
              density="compact"
              clearable
              variant="outlined"
              hide-details
              prepend-inner-icon="mdi-magnify"
              label="Search..."
            />

            <v-select
              v-model="filters.repository"
              :items="repoOptions"
              item-value="key"
              item-title="label"
              class="ma-1 my-2 my-md-0"
              small-chips
              clearable
              label="Repository"
              hide-details
              chips
              multiple
              density="compact"
              variant="outlined"
              closable-chips
            />
          </div>

          <v-spacer />

          <v-speed-dial
            location="bottom center"
          >
            <template #activator="{ props }">
              <v-btn color="primary" rounded v-bind="props">
                <v-icon>mdi-plus</v-icon>
                New Submission
              </v-btn>
            </template>

            <v-card key="0">
              <v-card-text>
                <template v-for="repo of supportedRepoMetadata" :key="repo.name">
                  <v-tooltip v-if="!repo.isDisabled" left>
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="mx-0 mb-4"
                        block
                        color="white"
                        @click="submitTo(repo)"
                      >
                        {{ repo.name }}
                      </v-btn>
                    </template>
                    <span>{{ repo.submitTooltip }}</span>
                  </v-tooltip>
                </template>

                <v-tooltip v-if="!externalRepoMetadata?.isDisabled" left>
                  <template #activator="{ props }">
                    <v-btn
                      class="mx-0"
                      v-bind="props"
                      color="white"
                      block
                      @click="openRegisterDatasetDialog"
                    >
                      {{ externalRepoMetadata?.name }}
                    </v-btn>
                  </template>
                  <span>{{ externalRepoMetadata?.submitTooltip }}</span>
                </v-tooltip>
              </v-card-text>
            </v-card>
          </v-speed-dial>
        </div>
      </div>
    </div>

    <template v-if="isFetching">
      <v-progress-circular indeterminate color="primary" />
    </template>
    <template v-else>
      <div v-if="submissions.length" class="mt-4">
        <div>
          <div id="total_submissions" class="mb-2 text-h6">
            {{ submissions.length }} Total Submissions
          </div>
          <p v-if="isAnyFilterAcitve" class="font-weight-light">
            {{ filteredSubmissions.length }} Results
          </p>
        </div>

        <v-card>
          <div v-if="!isFetching">
            <v-data-iterator
              v-model:page="page"
              v-model:items-per-page="itemsPerPage"
              :items="filteredSubmissions"
              :search="filters.searchStr"
              :sort-by="[sortBy]"
              item-key="identifier"
              hide-default-footer
            >
              <template #header>
                <div elevation="0" class="has-bg-light-gray pa-4">
                  <div
                    class="d-flex justify-space-between full-width flex-column flex-md-row gap-1"
                  >
                    <v-btn
                      class="mb-md-0 mb-4"
                      rounded
                      :disabled="!filteredSubmissions.length"
                      @click="exportSubmissions"
                    >
                      Export Submissions
                    </v-btn>
                    <v-spacer />
                    <div class="sort-controls d-flex flex-column flex-sm-row gap-1">
                      <v-select
                        id="sort-by"
                        v-model="sortBy.key"
                        :items="sortOptions"
                        item-title="label"
                        item-value="key"
                        class="sort-control"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        label="Sort by"
                      />

                      <v-select
                        id="sort-order"
                        v-model="sortBy.order"
                        :items="sortDirectionOptions"
                        item-title="label"
                        item-value="key"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        label="Order"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template #default="{ items }">
                <v-divider />
                <div
                  v-for="(item, index) in items"
                  :id="`submission-${index}`"
                  :key="item.raw.identifier"
                >
                  <div
                    class="table-item d-flex justify-space-between flex-column flex-md-row"
                  >
                    <div class="flex-grow-1 mr-4">
                      <table
                        class="text-body-1"
                        :class="{ 'is-xs-small': $vuetify.display.xs }"
                      >
                        <tr>
                          <td
                            :id="`sub-${index}-title`"
                            colspan="2"
                            class="text-h6 title"
                          >
                            {{ item.raw.title }}
                          </td>
                        </tr>
                        <tr v-if="item.raw.authors.length">
                          <th class="pr-4 text-body-2">
                            Authors:
                          </th>
                          <td>{{ item.raw.authors.join(" | ") }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4 text-body-2">
                            Submission Repository:
                          </th>
                          <td>{{ getRepositoryName(item.raw) }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4 text-body-2">
                            Submission Date:
                          </th>
                          <td :id="`sub-${index}-date`">
                            {{ getDateInLocalTime(item.raw.date) }}
                          </td>
                        </tr>
                        <tr>
                          <th class="pr-4 text-body-2">
                            Identifier:
                          </th>
                          <td>{{ item.raw.identifier }}</td>
                        </tr>
                        <tr
                          v-if="
                            item.raw.repository === enumRepositoryKeys.hydroshare
                          "
                        >
                          <th class="pr-4 text-body-2">
                            Type:
                          </th>
                          <td>{{ getItemResourceType(item.raw) }}</td>
                        </tr>
                        <tr
                          v-if="
                            item.raw.metadata.status
                              && item.raw.repository === enumRepositoryKeys.earthchem
                          "
                        >
                          <th class="pr-4 text-body-2">
                            Status:
                          </th>

                          <td>
                            <v-chip
                              v-if="item.raw.metadata.status !== 'incomplete'"
                              color="orange"
                              density="compact"
                              size="small"
                            >
                              <v-icon size="small" class="mr-1">
                                mdi-lock
                              </v-icon>
                              {{ item.raw.metadata.status }}
                            </v-chip>

                            <v-chip v-else size="small">
                              <v-icon size="small" class="mr-1">
                                mdi-pencil
                              </v-icon>
                              {{ item.raw.metadata.status }}
                            </v-chip>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div class="d-flex flex-column mt-4 mt-md-0 actions">
                      <v-btn
                        :id="`sub-${index}-view`"
                        :href="item.raw.url"
                        target="_blank"
                        color="blue-grey lighten-4"
                        rounded
                      >
                        <v-icon class="mr-1">
                          mdi-open-in-new
                        </v-icon> View In
                        Repository
                      </v-btn>
                      <v-btn
                        v-if="
                          !(
                            isItemHsCollection(item.raw)
                            || isItemPublished(item.raw)
                            || isItemEclSubmitted(item.raw)
                          )
                        "
                        :id="`sub-${index}-edit`"
                        rounded
                        @click="goToEditSubmission(item.raw)"
                      >
                        <v-icon class="mr-1">
                          mdi-pencil-outline
                        </v-icon> Edit
                      </v-btn>
                      <v-btn
                        v-if="!repoMetadata[item.raw.repository]?.isExternal"
                        :id="`sub-${index}-update`"
                        :disabled="
                          isUpdating[`${item.raw.repository}-${item.raw.identifier}`]
                        "
                        rounded
                        @click="onUpdateRecord(item.raw)"
                      >
                        <v-icon
                          v-if="
                            isUpdating[`${item.raw.repository}-${item.raw.identifier}`]
                          "
                        >
                          fas fa-circle-notch fa-spin
                        </v-icon>
                        <v-icon v-else>
                          mdi-sync
                        </v-icon><span class="ml-1">
                          {{
                            isUpdating[`${item.raw.repository}-${item.raw.identifier}`]
                              ? "Updating Record..."
                              : "Update Record"
                          }}</span>
                      </v-btn>
                      <v-btn
                        :id="`sub-${index}-delete`"
                        :disabled="isDeleteButtonDisabled(item.raw)"
                        rounded
                        @click="
                          onDelete(
                            item.raw,
                            repoMetadata[item.raw.repository]?.isExternal,
                          )
                        "
                      >
                        <v-icon
                          v-if="
                            isDeleting[`${item.raw.repository}-${item.raw.identifier}`]
                          "
                        >
                          fas fa-circle-notch fa-spin
                        </v-icon>
                        <v-icon v-else>
                          mdi-delete-outline
                        </v-icon><span class="ml-1">
                          {{
                            isDeleting[`${item.raw.repository}-${item.raw.identifier}`]
                              ? "Deleting..."
                              : "Delete"
                          }}</span>
                      </v-btn>
                    </div>
                  </div>
                  <v-divider />
                </div>
              </template>

              <template #footer>
                <div class="footer d-flex justify-space-between align-center">
                  <div>
                    <span class="grey--text text-body-2 mr-1">Items per page</span>

                    <v-menu offset-y>
                      <template #activator="{ props }">
                        <v-btn variant="text" v-bind="props">
                          {{ itemsPerPage }}
                          <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <!-- TODO: this is causing recursive updates -->
                        <v-list-item
                          v-for="number in itemsPerPageArray"
                          :key="number"
                          @click="itemsPerPage = number"
                        >
                          <v-list-item-title>{{ number }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <div
                    v-if="numberOfPages"
                    class="d-flex flex-sm-row flex-column align-center justify-center"
                    style="gap: 0.5rem"
                  >
                    <span class="grey--text text-body-2 text-center">
                      Page {{ page }} of {{ numberOfPages }}
                    </span>
                    <div>
                      <v-btn
                        class="mr-2"
                        small
                        fab
                        :disabled="page <= 1"
                        @click="formerPage"
                      >
                        <v-icon>mdi-chevron-left</v-icon>
                      </v-btn>
                      <v-btn
                        small
                        fab
                        :disabled="page >= numberOfPages"
                        @click="nextPage"
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </template>

              <template #no-data>
                <div class="text-subtitle-1 font-weight-light ma-4">
                  You don't have any submissions that match the selected
                  criteria.
                </div>
              </template>
            </v-data-iterator>
          </div>
        </v-card>
      </div>
      <div v-else class="text-body-2 text-center mt-4 d-flex flex-column">
        <template v-if="!submissions.length">
          <v-empty-state
            title="You have not created any submissions yet"
            icon="mdi-text-box-remove"
          />
        </template>
        <template v-if="!isLoggedIn">
          You need to log in to view this page
        </template>
      </div>
    </template>

    <v-dialog
      id="dialog-delete-submission"
      v-model="isDeleteDialogActive"
      persistent
      width="500"
    >
      <v-card>
        <v-card-title>Delete this submission?</v-card-title>
        <v-card-text v-if="deleteDialogData" class="text-body-1">
          <p class="mb-2">
            This action will delete the metadata for this submission in the data
            submission Portal.
          </p>
          <v-checkbox
            v-if="!deleteDialogData.isExternal"
            v-model="alsoDeleteInRepository"
            color="red"
            label="Also attempt to delete this resource and its content files from the repository. If the resource is permanently published (i.e., it has been assigned a DOI), we will not be able to remove it from the repository."
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="dialog-cancel"
            variant="elevated"
            elevation="1"
            @click="isDeleteDialogActive = false"
          >
            Cancel
          </v-btn>

          <v-btn
            class="dialog-confirm"
            color="red darken-1"
            variant="elevated"
            @click="
              isDeleteDialogActive = false;
              onDeleteSubmission();
            "
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <cz-register-dataset-dialog ref="registerDatasetDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Ref, mixins, toNative } from 'vue-facing-decorator'
import { Subscription } from 'rxjs'
import type {
  IRepository,
  ISubmission,
} from '~/components/submissions/types'
import {
  EnumRepositoryKeys,
  EnumSortDirections,
  EnumSubmissionSorts,
} from '~/components/submissions/types'
import { repoMetadata } from '~/components/submit/constants'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'
import {
  itemsPerPageArray,
  sortDirectionsOverrides,
} from '~/components/submissions/constants'
import { getRepositoryFromKey } from '~/constants'
import CzRegisterDatasetDialog from '~/components/register-dataset/cz.register-dataset-dialog.vue'

// import { formatDistanceToNow } from 'date-fns'
import Submission from '~/models/submission.model'
import Repository from '~/models/repository.model'
import User from '~/models/user.model'
import { isRepositoryAuthorized } from '~/util'

@Component({
  name: 'cz-submissions',
  components: { CzRegisterDatasetDialog },
})
class CzSubmissions extends mixins(ActiveRepositoryMixin) {
  @Ref('registerDatasetDialog') registerDatasetDialog!: InstanceType<
    typeof CzRegisterDatasetDialog
  >

  isUpdating: { [key: string]: boolean } = {}
  isDeleting: { [key: string]: boolean } = {}
  isDeleteDialogActive = false
  deleteDialogData: {
    submission: ISubmission
    isExternal: boolean
  } | null = null

  alsoDeleteInRepository = false

  filters: {
    repository: string[]
    searchStr: string
  } = { repository: [], searchStr: '' }

  itemsPerPageArray = itemsPerPageArray
  page = 1
  repoMetadata = repoMetadata
  enumRepositoryKeys = EnumRepositoryKeys
  loggedInSubject = new Subscription()

  get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata).map(r => repoMetadata[r])
  }

  get supportedRepoMetadata() {
    return this.repoCollection.filter(r => !r.isExternal && r.isSupported)
  }

  get externalRepoMetadata() {
    return this.repoCollection.find(r => r.isExternal)
  }

  get itemsPerPage() {
    return Submission.$state.itemsPerPage
  }

  set itemsPerPage(itemsPerPage: number) {
    Submission.commit((state) => {
      state.itemsPerPage = itemsPerPage
    })
  }

  get isFetching() {
    return Submission.$state.isFetching
  }

  get repoOptions(): { key: string, label: string }[] {
    return Object.keys(repoMetadata)
      .filter(key => repoMetadata[key].isSupported)
      .map(key => ({ key, label: repoMetadata[key].name }))
  }

  get sortOptions() {
    return Object.keys(EnumSubmissionSorts).map((key) => {
      return { key, label: EnumSubmissionSorts[key as keyof typeof EnumSubmissionSorts] }
    })
  }

  get sortBy() {
    return Submission.$state.sortBy
  }

  set sortBy(sortBy: { key: string, order: 'asc' | 'desc' }) {
    Submission.commit((state) => {
      state.sortBy = sortBy
    })
  }

  get isLoggedIn() {
    return User.$state.isLoggedIn
  }

  get isAnyFilterAcitve() {
    return Object.keys(this.filters).find(
      key => this.filters[key] && this.filters[key].length,
    )
  }

  get sortDirectionOptions() {
    return Object.keys(EnumSortDirections).map((key) => {
      return {
        key,
        label: sortDirectionsOverrides[this.sortBy.key]?.[key as keyof typeof EnumSortDirections]
        || EnumSortDirections[key as keyof typeof EnumSortDirections],
      }
    })
  }

  get filteredSubmissions() {
    if (this.filters.repository.length) {
      return Submission.all().filter(s =>
        this.filters.repository.includes(s.repository),
      )
    }

    return Submission.all()
  }

  get submissions(): ISubmission[] {
    return Submission.all()
  }

  get repoName(): string {
    if (this.deleteDialogData) {
      return (
        getRepositoryFromKey(this.deleteDialogData.submission.repository)
          ?.name || ''
      )
    }

    return ''
  }

  get numberOfPages() {
    return this.isAnyFilterAcitve
      ? Math.ceil(this.filteredSubmissions.length / this.itemsPerPage)
      : Math.ceil(this.submissions.length / this.itemsPerPage)
  }

  created() {
    if (User.$state.isLoggedIn)
      Submission.fetchSubmissions()

    this.loggedInSubject = User.loggedIn$.subscribe(() => {
      Submission.fetchSubmissions()
    })
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe()
  }

  nextPage() {
    if (this.page + 1 <= this.numberOfPages)
      this.page += 1
  }

  formerPage() {
    if (this.page - 1 >= 1)
      this.page -= 1
  }

  goToEditSubmission(submission: ISubmission) {
    const repo: IRepository = repoMetadata[submission.repository]
    this.router.push({
      name: 'submit.repository',
      params: { repository: repo.key, id: submission.identifier },
    })
  }

  getDateInLocalTime(date: number): string {
    const offset = new Date(date).getTimezoneOffset() * 60 * 1000
    // TODO: subtracting offset because db stored dates seem to have the time shifted
    const localDateTime = date - offset
    const localizedDate = new Date(localDateTime).toLocaleString()
    // const ago = formatDistanceToNow(new Date(localDateTime), { addSuffix: true })
    return localizedDate
  }

  openRegisterDatasetDialog() {
    this.registerDatasetDialog.active = true
  }

  async onUpdateRecord(submission: ISubmission) {
    const key = `${submission.repository}-${submission.identifier}`
    this.isUpdating[key] = true

    await Repository.refetchSubmission(
      submission.identifier,
      submission.repository,
    )

    this.isUpdating[key] = false
  }

  exportSubmissions() {
    const parsedSubmissions = this.filteredSubmissions.map((s) => {
      return {
        authors: s.authors.join('; '),
        date: new Date(s.date).toISOString(),
        title: s.title,
        repository: this.getRepositoryName(s),
        url: s.url,
      }
    })

    const columnLabels = [
      'Authors',
      'Publication Date',
      'Title',
      'Repository',
      'URL',
    ]

    const headerRow = `${columnLabels.join(',')}\n`
    const rows = parsedSubmissions.map((s) => {
      return Object.keys(s).map((key: string) => `"${s[key]}"`)
    })

    const csvContent = headerRow + rows.map(c => c.join(',')).join('\n')

    // Download as CSV
    const filename = `${this.$t('footer.orgName')}_submissions.csv`

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/plain;charset=utf-8,${encodeURIComponent(csvContent)}`,
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }

  isDeleteButtonDisabled(item) {
    return this.isDeleting[`${item.repository}-${item.identifier}`]
  }

  isItemHsCollection(submission: ISubmission) {
    return (
      submission.repository === EnumRepositoryKeys.hydroshare
      && submission.metadata.type === 'CollectionResource'
    )
  }

  isItemPublished(submission): boolean {
    if (submission.repository === EnumRepositoryKeys.hydroshare)
      return !!submission?.metadata.published
    else if (submission.repository === EnumRepositoryKeys.earthchem)
      return submission?.metadata?.status === 'published'
    else if (submission.repository === EnumRepositoryKeys.zenodo)
      return !!submission?.metadata?.doi

    return false
  }

  isItemEclSubmitted(submission): boolean {
    return (
      submission.repository === EnumRepositoryKeys.earthchem
      && submission?.metadata.status === 'submitted'
    )
  }

  onDelete(submission: ISubmission, isExternal: boolean) {
    this.deleteDialogData = { submission, isExternal }
    this.alsoDeleteInRepository = false // we want it unchecked initially
    this.isDeleteDialogActive = true
  }

  async onDeleteSubmission() {
    const key = `${this.deleteDialogData?.submission.repository}-${this.deleteDialogData?.submission.identifier}`
    this.isDeleting[key] = true

    if (this.deleteDialogData) {
      const deleteInRepo
        = !this.deleteDialogData.isExternal && this.alsoDeleteInRepository

      if (deleteInRepo) {
        // Check that the user has authorized the selected repository
        if (
          !isRepositoryAuthorized(this.deleteDialogData.submission.repository)
        ) {
          this.isDeleting[key] = false
          this.authorizedSubject = Repository.authorized$.subscribe(
            async (_repositoryKey: EnumRepositoryKeys) => {
              // try again when the repository has been authorized
              await this.onDeleteSubmission()
            },
          )
          return
        }
      }

      await Repository.deleteSubmission(
        this.deleteDialogData.submission.identifier,
        this.deleteDialogData.submission.repository,
        deleteInRepo,
      )
    }

    this.isDeleting[key] = false
    this.deleteDialogData = null
  }

  getRepositoryName(item: ISubmission) {
    // For external submissions, we return the provider name instead
    if (item.repository === EnumRepositoryKeys.external)
      return item.metadata.provider?.name || ''

    return repoMetadata[item.repository]
      ? repoMetadata[item.repository].name
      : ''
  }

  getItemResourceType(item: ISubmission) {
    // For hydroshare submissions, get the resource type
    if (item.repository === EnumRepositoryKeys.hydroshare) {
      if (item.metadata.type === 'CollectionResource')
        return 'Collection'
      else return 'Resource'
    }
    return ''
  }
}
export default toNative(CzSubmissions)
</script>

<style lang="scss" scoped>
.cz-submissions {
  padding: 1rem;
  min-height: 30rem;
}

.v-card {
  margin: 0;
}

.footer {
  padding: 1rem;
}

.table-item {
  padding: 1rem;

  table {
    width: 100%;

    &.is-xs-small {
      tr,
      td,
      th {
        display: block;
        text-align: left;
      }

      th {
        padding-top: 1rem;
      }
    }

    th {
      text-align: right;
      width: 11rem;
      font-weight: normal;
      text-wrap: nowrap;
    }

    td {
      word-break: break-word;

      &.title {
        padding-left: 1.25rem;
        border-left: 4px solid #ddd;
      }
    }
  }
}

.actions {
  align-content: flex-end;
}

.actions .v-btn {
  margin: 0.5rem 0;
  // max-width: 30rem;
}

.sort-controls {
  // max-width: 30rem;
  display: flex;

  > * {
    min-width: 15rem;
  }
}

.v-speed-dial {
  :deep(.v-speed-dial__list) {
    width: auto;

    .v-btn {
      min-width: 12rem;
    }
  }
}
</style>
