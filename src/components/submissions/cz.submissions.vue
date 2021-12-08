<template>
  <div class="cz-submissions">
    <template v-if="identifier !== undefined" >
      <cz-submission :identifier="identifier" @edit="goToEditSubmission($event)"/>
    </template>
    <template v-else>
      <div class="cz-submissions--header has-space-bottom-2x">
        <h1 class="md-display-1">My Submissions</h1>
        <hr>
        <div v-if="!isFetching && submissions.length" class="md-layout md-alignment-center-space-between">
          <div style="flex-grow: 1; margin-right: 2rem;">
            <md-card-content id="filters" class="md-layout">
              <md-field class="md-layout-item" md-clearable>
                <md-icon>search</md-icon>
                <label>Search by Title and Author</label>
                <md-input v-model="filters.searchStr"></md-input>
              </md-field>

              <md-field class="md-layout-item">
                <label for="repository">Repository</label>
                <md-select v-model="filters.repoOptions" multiple id="repository" md-dense>
                  <md-option v-for="(repo, index) of repoOptions" :key="index" :value="repo">{{ repoMetadata[repo].name }}</md-option>
                </md-select>
              </md-field>
            </md-card-content>
          </div>

          <md-speed-dial md-direction="bottom">
            <md-speed-dial-target>
              <md-icon>add</md-icon>
            </md-speed-dial-target>

            <md-speed-dial-content>
              <md-button  v-for="(repo, index) in repoOptions" :key="index" class="md-default" @click="submitTo(repoMetadata[repo])">{{ repoMetadata[repo].name }}</md-button>
            </md-speed-dial-content>
          </md-speed-dial>
        </div>
      </div>

      <template v-if="isFetching">
        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
      </template>
      <template v-else>
        <div v-if="submissions.length">
          <div class="md-layout md-alignment-center-space-between">
            <h3 class="md-title has-space-bottom">{{ submissions.length }} Total Submissions</h3>
            <p v-if="isAnyFilterAcitve" class="has-text-mute">{{ filteredSubmissions.length }} Results</p>
          </div>

          <md-card class="panel">
            <md-toolbar class="md-layout md-alignment-center-space-between" md-elevation="0">
              <md-button class="md-raised">Export Submissions</md-button>
              <!-- <hr class="is-hidden-tablet"> -->
              <div class="md-layout-item md-layout md-alignment-center-flex-end md-size-50 md-small-size-100 md-gutter">
                <md-field class="md-layout-item">
                  <label for="sorts">Sort</label>
                  <md-select v-model="currentSort.defaultSort" id="sorts" md-dense>
                    <md-option v-for="sort in sortOptions" :value="sort" :key="sort">{{ enumSubmissionSorts[sort] }}</md-option>
                  </md-select>
                </md-field>

                <md-field class="md-layout-item">
                  <md-select v-model="currentSort.defaultSortDirection" md-dense>
                    <md-option v-for="direction in sortDirectionOptions" :value="direction" :key="direction">{{ enumSortDirections[direction] }}</md-option>
                  </md-select>
                </md-field>
              </div>
            </md-toolbar>

            <md-card-content v-if="!isFetching">
              <md-table v-model="filteredSubmissions" :md-sort="currentSort.defaultSort" :md-sort-order="currentSort.defaultSortDirection" ref="submissionsTable">
                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell>
                    <b>Title: </b> <span class="md-subheading">{{ item.title }}</span>
                    <p class="has-text-left"><b>Authors: </b>{{ item.authors.join(', ')}}</p>
                    <p class="has-text-left"><b>Submission Repository: </b>{{ repoMetadata[item.repository].name }}</p>
                    <p class="has-text-left"><b>Submission Date: </b>{{ new Date(item.date).toLocaleString() }}</p>
                    <p class="has-text-left"><b>Identifier: </b>{{ item.identifier }}</p>
                  </md-table-cell>

                  <md-table-cell>
                    <div class="md-layout actions" style="flex-direction: column;">
                      <md-button :href="item.url" target="_blank" class="md-raised md-accent" expanded size="is-medium" type="is-primary">
                        <md-icon>open_in_new</md-icon> View In Repository
                      </md-button>
                      <!-- <md-button class="md-raised md-primary" expanded size="is-medium">Edit Submission</md-button> -->
                      <md-button class="md-raised" @click="goToSubmission(item)">View</md-button>
                      <md-button class="md-raised" @click="onUpdateRecord(item)" 
                        :disabled="isUpdating[`${item.repository}-${item.identifier}`]">
                        <md-icon>sync</md-icon> {{ isUpdating[`${item.repository}-${item.identifier}`] ? 'Updating...' : 'Update Record'}}
                      </md-button>
                      <md-button class="md-raised" @click="goToEditSubmission(item)"><md-icon>edit</md-icon> Edit</md-button>
                    </div>
                  </md-table-cell>
                </md-table-row>

                <!-- TODO: this feature is not released yet -->
                <!-- https://www.creative-tim.com/vuematerial/components/table -->
                
                <md-table-pagination
                  ref="paginator"
                  @update:md-page-size="onCurrentPageSizeChanged"
                  :md-page="currentPage"
                  :md-page-options="[5, 10, 15, 20]"
                  :md-total="filteredSubmissions.length"
                  :md-update="updatePagination"
                  :md-data="paginatedSubmissions"
                  :md-paginated-data.sync="paginatedSubmissions" />
    <!-- 
                <md-table-empty-state
                  md-label="No submissions found"
                  :md-description="`No submissions found for this '${filters.searchStr}' query. Try a different search term or create a new submissions.`">
                  <md-button class="md-primary md-raised" @click="null">Create New Submission</md-button>
                </md-table-empty-state> -->
              </md-table>
            </md-card-content>
          </md-card>
        </div>

        <md-empty-state
          v-else
          md-icon="devices_other"
          md-label="Create your first submission"
          md-description="Assemble your data files and metadata using our templates and submit directly to a supported repository.">
          <md-speed-dial md-direction="bottom">
            <md-speed-dial-target>
              <md-icon>add</md-icon>
            </md-speed-dial-target>

            <md-speed-dial-content>
              <md-button  v-for="(repo, index) in repoOptions" :key="index" class="md-default" @click="submitTo(repoMetadata[repo])">{{ repoMetadata[repo].name }}</md-button>
            </md-speed-dial-content>
          </md-speed-dial>
        </md-empty-state>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Ref, Watch } from 'vue-property-decorator'
  import { ISubmission, EnumSubmissionSorts, EnumSortDirections, EnumRepositoryKeys, IRepository } from '@/components/submissions/types'
  import { repoMetadata } from '../submit/constants'
  import CzSubmission from '@/components/submission/cz.submission.vue'
  import Submission from '@/models/submission.model'
  import Repository from '@/models/repository.model'
  import HydroShare from '@/models/hydroshare.model'
  import Zenodo from '@/models/zenodo.model'

  @Component({
    name: 'cz-submissions',
    components: { CzSubmission },
  })
  export default class CzSubmissions extends Vue {
    @Ref('submissionsTable') submissionsTable
    @Ref('paginator') paginator
    protected isUpdating: {[key: string]: boolean} = {}

    protected currentSort = {
      defaultSort: 'title',
      defaultSortDirection: 'asc'
    }

    protected filters: {
      repoOptions: string[],
      searchStr: string
    } = { repoOptions: [], searchStr: '' }

    protected repoMetadata = repoMetadata
    protected enumSubmissionSorts = EnumSubmissionSorts
    protected enumSortDirections = EnumSortDirections
    protected filteredSubmissions: ISubmission[] = []
    protected paginatedSubmissions: ISubmission[] = []
    protected currentPage = 1
    protected currentPageSize = 5

    protected get isFetching() {
      return Submission.$state.isFetching
    }

    protected get repoOptions() {
      return Object.keys(repoMetadata)
    }

    protected get sortOptions() {    
      return  Object.keys(EnumSubmissionSorts)
    }

    protected get sortDirectionOptions() {
      return Object.keys(EnumSortDirections)
    }

    protected get isAnyFilterAcitve() {
      return Object.keys(this.filters).find(key => this.filters[key].length)
    }

    protected get submissions(): ISubmission[] {
      return Submission.all()
    }

    protected updatePagination (page, pageSize, sort, sortOrder) {
      console.log('pagination has updated', page, pageSize, sort, sortOrder);
    }

    protected get identifier() {
      return this.$route.params.id
    }

    // TODO: add to a mixin and reuse
    protected get activeRepository() {
      const key = Repository.$state.submittingTo
      switch (key) {
        case EnumRepositoryKeys.hydroshare: return HydroShare
        case EnumRepositoryKeys.zenodo: return Zenodo
        default: return HydroShare
      }
    }

    protected searchOnTable() {
      const data = this.submissions
      // const data = SUBMISSIONS // TESTING
      const filteredRepos = this.filters.repoOptions //.map(r => repoMetadata[r].name)
      const query = this.filters.searchStr.toLowerCase().trim()

      this.filteredSubmissions = data.filter((d) => {
        // Filter by repository
        if (filteredRepos.length) {
          if (!filteredRepos.includes(d.repository)) {
            return false
          }
        }

        // Filter by search query
        if (query) {
          const occursInTitle = d.title.toLowerCase().indexOf(query) >= 0
          const occursInAuthors= d.authors.some(a => a.toLowerCase().indexOf(query) >= 0)
          
          if (!occursInTitle && !occursInAuthors) {
            return false
          }
        }

        return true
      })

      this.$nextTick(() => {
        if (!this.paginator) {
          return []
        }
        const start = (this.currentPage - 1) * this.paginator.currentPageSize
        const end = start + this.paginator.currentPageSize
        this.paginatedSubmissions = this.filteredSubmissions.slice(start, end)
      })
    }

    async created() {
      // TODO: avoid making this call again if app loading from this page
      await Submission.fetchSubmissions()
      // this.filteredSubmissions = SUBMISSIONS // Uncomment this if you want to test with mock data
      this.filteredSubmissions = this.submissions

      // Implement missing functionality for WIP components.
      // https://www.creative-tim.com/vuematerial/components/table
      if (!this.identifier) {
        this.$nextTick(()=> {
          const that = this
          this.paginator.goToNext = () => {
            const maxPages = Math.ceil(that.filteredSubmissions.length / that.paginator.currentPageSize)
            that.currentPage = Math.min(that.currentPage + 1, maxPages)
            that.searchOnTable()
          }
          this.paginator.goToPrevious = () => {
            const minPages = 1
            that.currentPage = Math.max(that.currentPage - 1, minPages)
            that.searchOnTable()
          }
        })
      }
    }

    protected goToSubmission(submission: Submission){
      this.$router.push({ name: 'submissions', params: { id: submission.identifier, repository: submission.repository }})
    }

    protected goToEditSubmission(submission: ISubmission) {
      const repo: IRepository = repoMetadata[submission.repository]
      this.$router.push({ name: 'submit.repository', params: { repository: repo.key, id: submission.identifier }})
    }

    protected async onUpdateRecord(submission: ISubmission) {
      this.$set(this.isUpdating, `${submission.repository}-${submission.identifier}`, true)
      await this.activeRepository.updateCzHubRecord(submission.identifier, submission.repository)
      this.$set(this.isUpdating, `${submission.repository}-${submission.identifier}`, false)
    }

    // TODO: move to mixin and reuse
    // =================
    protected submitTo(repo: IRepository) {
      if (Object.keys(EnumRepositoryKeys).includes(repo.key)) {
        this.setActiveRepository(repo.key)
      }
      this.$router.push({ name: 'submit.repository', params: { repository: repo.key } }).catch(() => {})
    }

    private setActiveRepository(key: EnumRepositoryKeys) {
      Repository.commit((state) => {
        state.submittingTo = key
      })
    }
    // =================

    @Watch('currentSort', { deep: true })
    protected onDefaultSortChanged(newSort, oldSort) {
      this.$nextTick(() => {
        this.submissionsTable.sortTable()
      })
    }

    @Watch('filters', { deep: true })
    protected onFiltersChanged(newFilters, oldFilters) {
      this.$nextTick(() => {
        this.searchOnTable()
      })
    }

    @Watch('submissions')
    onSubmissionsChange() {
      // Used to propagate changes when submissions are deleted
      this.searchOnTable()
    }

    @Watch('paginator.currentPageSize', { deep: true })
    onCurrentPageSizeChanged(oldVal, newVal) {
      console.log(oldVal, newVal)
    }
  }
</script>

<style lang="scss" scoped>
  .cz-submissions {
    padding: 1rem;
  }

  .md-card {
    margin: 0;
  }

  #filters {
    // max-width: 60rem;
    & > .md-field {
      margin: 0 1rem;
    }
  }

  .md-toolbar {
    padding: 1rem;
  }

  .actions {
    align-content: flex-end;
  }
  
  .actions .md-button {
    margin: 1rem 0;
    max-width: 30rem;
  }

  /deep/ .md-table-head {
    display: none;
  }

  .md-speed-dial {
    position: relative;

    .md-speed-dial-content {
      position: absolute;
      top: 6rem;
      right: 0;
      align-items: flex-end;

      button {
        width: 100%;
      }

      button + button {
        margin-top: 1rem;
      }
    }
  }

  .md-empty-state .md-speed-dial-content {
    position: absolute;
    top: 6rem;
    align-items: flex-end;
    width: 18rem;
    left: -6rem;
  }

  .cz-submissions--header .md-card {
    background: var(--md-theme-default-background-variant, #fafafa)
  }
</style>
