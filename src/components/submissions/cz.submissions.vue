<template>
  <div class="cz-submissions">
    <section class="cz-submissions--header">
      <div class="md-layout md-alignment-center-space-between">
        <h1 class="md-display-1">My Submissions</h1>
        <div class="">
          <md-field>
            <label for="repository">New Submission</label>
            <md-select id="repository">
              <md-option v-for="(repo, index) in repoOptions" :value="repo" :key="index">{{ repoMetadata[repo].name }}</md-option>
            </md-select>
          </md-field>
        </div>
      </div>

      <md-card>
        <md-card-content id="filters">
          <md-field>
            <md-icon>search</md-icon>
            <label>Search by Title and Author</label>
            <md-input v-model="filters.searchStr"></md-input>
          </md-field>

          <md-field>
            <label for="status">Status</label>
            <md-select v-model="filters.statusOptions" multiple id="status">
              <md-option v-for="(status, index) of statusOptions" :key="index" :value="status">{{ enumSubmissionStatus[status] }}</md-option>
            </md-select>
          </md-field>

          <md-field>
            <label for="repository">Repository</label>
            <md-select v-model="filters.repoOptions" multiple id="repository">
              <md-option v-for="(repo, index) of repoOptions" :key="index" :value="repo">{{ repoMetadata[repo].name }}</md-option>
            </md-select>
          </md-field>
        </md-card-content>
      </md-card>
    </section>

    <section>
      <div class="md-layout md-alignment-center-space-between">
        <h3 class="md-title">{{ submissions.length }} Total Submissions</h3>
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
                <p class="has-text-left"><b>Submission Date: </b>{{ item.date.toLocaleDateString() }}</p>
                <p class="has-text-left"><b>Status: </b>{{ item.status }}</p>
                <p class="has-text-left"><b>Identifier: </b>{{ item.identifier }}</p>
              </md-table-cell>

              <md-table-cell>
                <div class="md-layout actions" style="flex-direction: column;">
                  <md-button class="md-raised md-accent" expanded size="is-medium" type="is-primary">View Record In Repository</md-button>
                  <md-button class="md-raised md-primary" expanded size="is-medium">Edit Submission</md-button>
                  <md-button class="md-raised md-primary" expanded size="is-medium">Update Record</md-button>
                </div>
              </md-table-cell>
            </md-table-row>

            <!-- TODO: this feature is not released yet -->
            <!-- https://www.creative-tim.com/vuematerial/components/table -->
            <md-table-pagination
              :md-page-size="5"
              :md-page-options="[5, 10, 15, 20]"
              :md-update="updatePagination"
              :md-data="filteredSubmissions"
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
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Ref, Watch } from 'vue-property-decorator'
  import { EnumSubmissionStatus, ISubmission, EnumSubmissionSorts, EnumSortDirections } from '@/components/submissions/types'
  import { repoMetadata } from '../submit/constants'
  import { SUBMISSIONS } from './submissions.mock'
  import Submission from '@/models/submission.model'

  @Component({
    name: 'cz-submissions',
    components: { },
  })
  export default class CzSubmissions extends Vue {
    @Ref('submissionsTable') submissionsTable

    protected currentSort = {
      defaultSort: 'title',
      defaultSortDirection: 'asc'
    }

    protected filters: {
      statusOptions: string[],
      repoOptions: string[],
      searchStr: string
    } = { statusOptions: [], repoOptions: [], searchStr: '' }

    protected repoMetadata = repoMetadata
    protected enumSubmissionStatus = EnumSubmissionStatus
    protected enumSubmissionSorts = EnumSubmissionSorts
    protected enumSortDirections = EnumSortDirections
    protected filteredSubmissions: ISubmission[] = []
    protected paginatedSubmissions: ISubmission[] = []

    protected get isFetching() {
      return Submission.$state.isFetching
    }

    protected get statusOptions() {
      return Object.keys(EnumSubmissionStatus)
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

    protected searchOnTable() {
      const data = this.submissions
      // const data = SUBMISSIONS // TESTING
      const filteredStatus = this.filters.statusOptions.map(s => EnumSubmissionStatus[s])
      const filteredRepos = this.filters.repoOptions.map(r => repoMetadata[r].name)
      const query = this.filters.searchStr.toLowerCase().trim()

      this.filteredSubmissions = data.filter((d) => {
        // Filter by status
        if (filteredStatus.length) {
          if (!filteredStatus.includes(d.status)) {
            return false
          }
        }

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
    }

    async created() {
      await Submission.fetchSubmissions()
      // this.filteredSubmissions = SUBMISSIONS // Testing
      this.filteredSubmissions = this.submissions
    }

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
  }
</script>

<style lang="scss" scoped>
  .cz-submissions {
    padding: 0 1rem;
  }

  .md-card {
    margin: 0;
  }

  #filters {
    max-width: 60rem;
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
</style>
