<template>
  <div class="cz-submissions">
    <div class="cz-submissions--header">
      <div class="text-h4">My Submissions</div>
      <v-divider class="has-space-bottom" />
      <div>
        <div class="d-flex align-center">
          <div v-if="!isFetching && submissions.length" class="d-flex">
            <v-text-field
              class="ma-1"
              v-model="filters.searchStr"
              dense
              clearable
              outlined
              hide-details
              prepend-inner-icon="mdi-magnify"
              label="Search..."
            />

            <v-select
              v-model="filters.repoOptions"
              :items="repoOptions"
              class="ma-1"
              small-chips
              deletable-chips
              clearable
              label="Repository"
              chips
              multiple
              dense
              outlined
            >
              <template v-slot:item="data">
                <v-list-item-action>
                  <v-icon v-if="data.attrs.inputValue">mdi-checkbox-marked</v-icon>
                  <v-icon v-else>mdi-checkbox-blank-outline</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ repoMetadata[data.item].name }}
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </v-select>
          </div>
          <v-spacer></v-spacer>

          <v-speed-dial
            transition="slide-y-reverse-transition"
            origin="center"
            direction="bottom"
          >
            <template v-slot:activator>
              <v-btn color="primary" rounded>
                <v-icon>mdi-plus</v-icon>
                New Submission
              </v-btn>
            </template>

            <v-btn v-for="repo of repoMetadata" :key="repo.name" @click="submitTo(repo)">
              {{ repo.name }}
            </v-btn>
          </v-speed-dial>
        </div>

        <!-- TODO: replace for menu -->
        <!-- @click="submitTo(repoMetadata[repo])">{{ repoMetadata[repo].name }} -->
      </div>
    </div>

    <template v-if="isFetching">
      <v-progress-circular indeterminate color="primary" />
    </template>
    <template v-else>
      <div v-if="submissions.length">
        <div>
          <div class="has-space-bottom text-h6">
            {{ submissions.length }} Total Submissions
          </div>
          <p v-if="isAnyFilterAcitve" class="text--secondary">
            {{ currentItems.length }} Results
          </p>
        </div>

        <v-card>
          <div v-if="!isFetching">
            <v-data-iterator
              @current-items="currentItems = $event"
              :items="filteredSubmissions"
              :items-per-page.sync="itemsPerPage"
              :page.sync="page"
              :search="filters.searchStr"
              :sort-by="sortBy.key || Object.keys(enumSubmissionSorts).find(k => enumSubmissionSorts[k] === sortBy)"
              :sort-desc="sortDirection.key === 'desc' || sortDirection === 'Descending'"
              item-key="identifier"
              hide-default-footer
            >
              <template v-slot:header>
                <v-toolbar elevation="0" class="has-bg-light-gray">
                  <template v-if="$vuetify.breakpoint.mdAndUp">
                    <v-btn rounded @click="exportSubmissions">Export Submissions</v-btn>
                    <v-spacer></v-spacer>
                    <div class="sort-controls">
                      <v-select
                        :items="sortOptions"
                        item-text="label"
                        v-model="sortBy"
                        class="mr-1 sort-control"
                        outlined
                        dense
                        hide-details
                        label="Sort by"
                      />
                      
                      <v-select
                        :items="sortDirectionOptions"
                        v-model="sortDirection"
                        class="sort-control"
                        item-text="label"
                        outlined
                        dense
                        hide-details
                        label="Order"
                      />
                    </div>
                  </template>
                </v-toolbar>
              </template>

              <template v-slot:default="{ items }">
                <v-divider />
                <div v-for="item in items" :key="item.identifier">
                  <div class="table-item d-flex justify-space-between">
                    <div class="flex-grow-1 mr-4">
                      <table class="text-body-1">
                        <tr>
                          <th class="pr-4"></th>
                          <td class="text-h6">{{ item.title }}</td>
                        </tr>
                        <tr v-if="item.authors.length">
                          <th class="pr-4">Authors:</th>
                          <td>{{ item.authors.join(", ") }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4">Submission Repository:</th>
                          <td>{{ repoMetadata[item.repository] ? repoMetadata[item.repository].name : '' }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4">Submission Date:</th>
                          <td>{{ new Date(item.date).toLocaleString() }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4">Identifier:</th>
                          <td>{{ item.identifier }}</td>
                        </tr>
                      </table>
                    </div>

                    <div class="d-flex flex-column actions">
                      <v-btn :href="item.url" target="_blank" color="blue-grey lighten-4" rounded>
                        <v-icon class="mr-1">mdi-open-in-new</v-icon> View In Repository
                      </v-btn>
                      <v-btn @click="goToEditSubmission(item)" rounded>
                        <v-icon class="mr-1">mdi-pencil</v-icon> Edit
                      </v-btn>
                      <v-btn
                        v-if="!repoMetadata[item.repository].isExternal"
                        @click="onUpdateRecord(item)"
                        :disabled="isUpdating[`${item.repository}-${item.identifier}`]"
                        rounded
                      >
                        <v-icon v-if="isUpdating[`${item.repository}-${item.identifier}`]">fas fa-circle-notch fa-spin</v-icon>
                        <v-icon v-else>mdi-update</v-icon><span class="ml-1"> Update Record</span>
                      </v-btn>
                      <v-btn @click="onDelete(item)" :disabled="isDeleting[`${item.repository}-${item.identifier}`]" rounded>
                        <v-icon v-if="isDeleting[`${item.repository}-${item.identifier}`]">fas fa-circle-notch fa-spin</v-icon>
                        <v-icon v-else>mdi-delete</v-icon><span class="ml-1">
                        {{ isDeleting[`${item.repository}-${item.identifier}`] ? 'Deleting...' : 'Delete' }}</span>
                      </v-btn>
                    </div>
                  </div>
                  <v-divider />
                </div>
              </template>

              <template v-slot:footer>
                <div class="footer d-flex justify-space-between">
                  <div>
                    <span class="grey--text text-body-2 mr-1">Items per page</span>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn text v-bind="attrs" v-on="on">
                          {{ itemsPerPage }}
                          <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="(number, index) in itemsPerPageArray"
                          :key="index"
                          @click="itemsPerPage = number"
                        >
                          <v-list-item-title>{{ number }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <div v-if="numberOfPages">
                    <span class="mr-4 grey--text text-body-2">
                      Page {{ page }} of {{ numberOfPages }}
                    </span>
                    <v-btn class="mr-2" small fab @click="formerPage" :disabled="page <= 1">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-btn small fab @click="nextPage" :disabled="page >= numberOfPages">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>

              <template v-slot:no-data>
                <div class="text-subtitle-1 text--secondary ma-4">
                  You don't have any submission that matches the selected criteria.
                </div>
              </template>

              <template v-slot:no-results>
                <div class="text-subtitle-1 text--secondary ma-4">
                  You don't have any submission that matches the selected criteria.
                </div>
              </template>
            </v-data-iterator>
          </div>
        </v-card>
      </div>
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
import { Component } from "vue-property-decorator";
import {
  ISubmission,
  EnumSubmissionSorts,
  EnumSortDirections,
  IRepository,
} from "@/components/submissions/types"
import { repoMetadata } from "../submit/constants"
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
import { Subscription } from "rxjs"
import Submission from "@/models/submission.model"
import Repository from "@/models/repository.model"
import CzNotification from "@/models/notifications.model"
import User from "@/models/user.model"

@Component({
  name: "cz-submissions",
  components: {  },
})
export default class CzSubmissions extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  protected isUpdating: { [key: string]: boolean } = {}
  protected isDeleting: { [key: string]: boolean } = {}

  protected filters: {
    repoOptions: string[]
    searchStr: string
  } = { repoOptions: [], searchStr: "" }

  protected itemsPerPage = 10
  protected itemsPerPageArray = [10, 25, 50]
  protected page = 1
  protected sortBy: { key: string, label: string } = { key: '', label: '' }
  protected sortDirection: { key: string, label: string } = { key: '', label: '' }
  protected repoMetadata = repoMetadata
  protected enumSubmissionSorts = EnumSubmissionSorts
  protected enumSortDirections = EnumSortDirections
  protected currentItems = []
  protected loggedInSubject = new Subscription()

  protected get isFetching() {
    return Submission.$state.isFetching
  }

  protected get repoOptions() {
    return Object.keys(repoMetadata)
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

  created() {
    // TODO: save this to persistent state
    this.sortDirection = this.sortDirectionOptions[0]
    this.sortBy = this.sortOptions[0]

    if (User.$state.isLoggedIn) {
      Submission.fetchSubmissions()
    }
    
    this.loggedInSubject = User.loggedIn$.subscribe(() => {
      Submission.fetchSubmissions()
    })
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe()
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

  protected exportSubmissions() {
    const parsedSubmissions: ISubmission[] = this.submissions.map((s) => {
      return {
        title: s.title,
        authors: s.authors,
        repository: s.repository,
        date: s.date,
        identifier: s.identifier,
        url: s.url,
        metadata: s.metadata
      }
    })

    // Download as JSON
    const filename = `CZNet_submissions.json`
    const jsonStr = JSON.stringify(parsedSubmissions, null, 2)

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr))
    element.setAttribute('download', filename)

    element.style.display = 'none';
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }

  protected onDelete(submission: ISubmission) {
    CzNotification.openDialog({
      title: 'Delete this submission?',
      content: 'Are you sure you want to delete this submission?',
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

// #filters {
// }

.footer {
  padding: 1rem;
}

.table-item {
  padding: 1rem;

  table th {
    text-align: right;
  }
}

.actions {
  align-content: flex-end;
}

.actions .v-btn {
  margin: 0.5rem 0;
  max-width: 30rem;
}

// .cz-submissions--header .v-card {
// }

.sort-controls {
  max-width: 30rem;
  display: flex;

  > * {
    width: 15rem;
  }
}

.v-speed-dial {
  ::v-deep .v-speed-dial__list {
    .v-btn {
      width: 12rem;
    }
  }
}
</style>
