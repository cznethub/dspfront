<template>
  <div class="cz-submissions">
    <div class="cz-submissions--header">
      <div class="text-h4">My Submissions</div>
      <v-divider class="has-space-bottom" />
      <div>
        <div class="d-flex align-center">
          <div v-if="!isFetching && submissions.length" class="d-flex">
            <v-text-field
              id="my_submissions_search"
              class="ma-1"
              v-model="filters.searchStr"
              dense
              clearable
              outlined
              hide-details="auto"
              prepend-inner-icon="mdi-magnify"
              label="Search..."
            />
          </div>
        </div>
      </div>
    </div>

    <template v-if="isFetching">
      <v-progress-circular indeterminate color="primary" />
    </template>
    
    <template v-else>
      <div v-if="submissions.length" class="mt-8">
        <div>
          <div id="total_submissions" class="has-space-bottom text-h6">
            {{ submissions.length }} Total Submissions
          </div>
          <p v-if="isAnyFilterAcitve" class="text--secondary">
            {{ currentItems.length }} Results
          </p>
        </div>

        <v-card>
          <v-data-table
            @current-items="currentItems = $event"
            @click:row="onRowClick"
            :headers="headers"
            :items="filteredSubmissions"
            :items-per-page.sync="itemsPerPage"
            :page.sync="page"
            :search="filters.searchStr"
            :sort-by="sortBy.key || Object.keys(enumSubmissionSorts).find(k => enumSubmissionSorts[k] === sortBy)"
            :sort-desc="sortDirection.key === 'desc' || sortDirection === 'Descending'"
            item-key="identifier"
            hide-default-footer
          >
            <template v-slot:item.created="{ item }">
              {{ (new Date(item.created)).toLocaleString() }}
            </template>

            <template v-slot:item.lastModified="{ item }">
              {{ (new Date(item.lastModified)).toLocaleString() }}
            </template>
          </v-data-table>
        </v-card>
      </div>
      <template v-else-if="wasUnauthorized">
        <v-alert class="text-subtitle-1" border="left" colored-border type="info" elevation="2">
          <v-row>
            <v-col class="flex-grow-1">We need your authorization to access HydroShare.</v-col>
            <v-col class="flex-grow-0">
              <v-btn @click="openAuthorizePopup" color="primary" class="mb-4">
                <i class="fas fa-key mr-2" />Authorize
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </template>
      <div v-else class="text-body-2 text-center mt-4 d-flex flex-column">
        <template v-if="!submissions.length">
          <v-icon style="font-size: 6rem;" class="mb-4">mdi-text-box-remove</v-icon>
          You have not created any submissions yet
        </template>
        <template v-if="!isLoggedIn">
          You need to log in to view this page
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator"
import {
  ISubmission,
  EnumSubmissionSorts,
  EnumSortDirections,
  IRepository,
  EnumRepositoryKeys,
} from "@/components/submissions/types"
import { repoMetadata } from "@/components/submit/constants"
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
import { Subscription } from "rxjs"
import { itemsPerPageArray } from '@/components/submissions/constants'
import Submission from "@/models/submission.model"
import Repository from "@/models/repository.model"
import CzNotification from "@/models/notifications.model"
import User from "@/models/user.model"

@Component({
  name: "cz-submissions",
  components: { },
})
export default class CzSubmissions extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  protected isUpdating: { [key: string]: boolean } = {}
  protected isDeleting: { [key: string]: boolean } = {}

  protected filters: {
    repoOptions: string[]
    searchStr: string
  } = { repoOptions: [], searchStr: "" }

  protected itemsPerPageArray = itemsPerPageArray
  protected page = 1
  protected repoMetadata = repoMetadata
  protected enumSubmissionSorts = EnumSubmissionSorts
  protected enumSortDirections = EnumSortDirections
  protected currentItems = []
  protected loggedInSubject = new Subscription()
  protected authorizedSubject = new Subscription()
  protected headers = [
    { text: 'Title', value: 'title', sortable: true },
    { text: 'First Author', value: 'authors' },
    { text: 'Date Created', value: 'created' },
    { text: 'Last Modified', value: 'lastModified' },
  ]
  protected wasUnauthorized = false

  protected get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata)
      .map(r => repoMetadata[r])
  }

  protected get supportedRepoMetadata() {
    return this.repoCollection.filter(r => r.isExternal || r.isSupported)
  }

  protected get sortBy() {
    return Submission.$state.sortBy
  }

  protected  set sortBy(sortBy: { key: string, label: string }) {
    Submission.commit((state) => {
      state.sortBy = sortBy
    })
  }

  protected get sortDirection() {
    return Submission.$state.sortDirection
  }

  protected set sortDirection(sortDirection: { key: string, label: string }) {
    Submission.commit((state) => {
      state.sortDirection = sortDirection
    })
  }

  protected get itemsPerPage() {
    return Submission.$state.itemsPerPage
  }

  protected set itemsPerPage(itemsPerPage: number) {
    Submission.commit((state) => {
      state.itemsPerPage = itemsPerPage
    })
  }

  protected get isFetching() {
    return Submission.$state.isFetching
  }

  protected get repoOptions() {
    return Object.keys(repoMetadata)
      .filter(key => repoMetadata[key].isSupported)
  }

  protected get sortOptions() {
    return Object.keys(EnumSubmissionSorts).map(key => { return { key: key, label: EnumSubmissionSorts[key]} })
  }

  protected get isLoggedIn() {
      return User.$state.isLoggedIn
    }

  protected get sortDirectionOptions() {
    return Object.keys(EnumSortDirections).map(key => { return { key: key, label: EnumSortDirections[key]} })
  }

  protected get isAnyFilterAcitve() {
    return Object.keys(this.filters).find(
      (key) => this.filters[key] && this.filters[key].length
    )
  }

  protected get filteredSubmissions() {
    console.log(Submission.all())
    if (this.filters.repoOptions.length) {
      return Submission.all().filter(s => this.filters.repoOptions.includes(s.repository))
    }
    return Submission.all()
  }

  protected get submissions(): ISubmission[] {
    return Submission.all()
  }

  protected updatePagination(page, pageSize, sort, sortOrder) {
    console.log("pagination has updated", page, pageSize, sort, sortOrder)
  }

  protected get numberOfPages() {
    if (this.isAnyFilterAcitve) {
      return Math.ceil(this.currentItems.length / this.itemsPerPage)
    }
    return Math.ceil(this.submissions.length / this.itemsPerPage)
  }

  async created() {
    if (User.$state.isLoggedIn) {
      const response = await Submission.fetchSubmissions()
      if (response === 403) {
        this.wasUnauthorized = true
      }
    }
    
    this.loggedInSubject = User.loggedIn$.subscribe(async () => {
      const response = await Submission.fetchSubmissions()
      if (response === 403) {
        this.wasUnauthorized = true
      }
    })

    this.authorizedSubject = Repository.authorized$.subscribe(async () => {
      const response = await Submission.fetchSubmissions()
      if (response === 403) {
        this.wasUnauthorized = true
      }
    })
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe()
    this.authorizedSubject.unsubscribe()
  }

  protected onRowClick(submission: ISubmission, item) {
    this.goToEditSubmission(submission)
  }

  protected nextPage() {
    if (this.page + 1 <= this.numberOfPages) this.page += 1
  }

  protected formerPage() {
    if (this.page - 1 >= 1) this.page -= 1
  }

  protected goToEditSubmission(submission: ISubmission) {
    const repo: IRepository = repoMetadata[submission.repository]
    this.$router.push({
      name: "submit.repository",
      params: { repository: repo.key, id: submission.identifier },
    })
  }

  protected async onUpdateRecord(submission: ISubmission) {
    this.$set(
      this.isUpdating,
      `${submission.repository}-${submission.identifier}`,
      true
    )
    await Repository.refetchSubmission(
      submission.identifier,
      submission.repository
    )
    this.$set(
      this.isUpdating,
      `${submission.repository}-${submission.identifier}`,
      false
    )
  }

  protected async openAuthorizePopup() {
    const repository = this.getRepositoryFromKey('hydroshare')
    Repository.authorize(repository)  // We don't need to provide a callback because we already have a subject set
  }

  protected onDelete(submission: ISubmission, isExternal: boolean) {
    CzNotification.openDialog({
      title: 'Delete this submission?',
      content: isExternal 
        ? 'This action will delete metadata about your submission from the Data Submission Portal. It will not affect your resource in the external repository.'
        : 'THIS ACTION WILL ALSO ATTEMPT TO DELETE THE SUBMISSION IN THE REPOSITORY.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        this.$set(
          this.isDeleting,
          `${submission.repository}-${submission.identifier}`,
          true
        )
        await Repository.deleteSubmission(submission.identifier, submission.repository)
        this.$set(
          this.isDeleting,
          `${submission.repository}-${submission.identifier}`,
          false
        )
      }
    })
  }

  protected getRepositoryName(item: ISubmission) {
    // For external submissions, we return the provider name instead
    if (item.repository === EnumRepositoryKeys.external) {
      return item.metadata.provider?.name || ''
    }

    return repoMetadata[item.repository]
      ? repoMetadata[item.repository].name
      : ''
  }
}
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

::v-deep table > tbody > tr {
  cursor: pointer;
}

.table-item {
  padding: 1rem;

  table th {
    text-align: right;
    width: 15rem;
  }
}

.actions {
  align-content: flex-end;
}

.actions .v-btn {
  margin: 0.5rem 0;
  max-width: 30rem;
}

.sort-controls {
  max-width: 30rem;
  display: flex;

  > * {
    width: 15rem;
  }
}

.v-speed-dial {
  ::v-deep .v-speed-dial__list {
    width: auto;

    .v-btn {
      min-width: 12rem;
    }
  }
}
</style>
