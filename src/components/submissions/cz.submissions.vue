<template>
  <div class="cz-submissions">
    <section class="section cz-submissions--header">
      <div class="container">
        <div class="level is-justify-content-space-between">
          <h1 class="title is-1">My Submissions</h1>
          <div class="level">
            <span class="has-space-right">New Submission</span>
            <b-field>
              <b-select size="is-medium" placeholder="Select a repository">
                <option v-for="(repo, index) in repoOptions" :value="repo" :key="index">{{ enumRepositories[repo] }}</option>
              </b-select>
            </b-field>
          </div>
        </div>

        <div class="box">
          <div id="filters">
            <b-field label="Search by Title and Author">
              <b-input placeholder="Search submissions..." size="is-medium" icon="search" />
            </b-field>

            <div class="is-flex is-justify-content-flex-start is-align-items-flex-start is-flex-wrap-wrap">
              <div class="block is-flex has-space-right is-flex-direction-column">
                <label for="status" class="has-text-weight-bold has-space-bottom">Status</label>
                <div id="status" class="is-grid" style="grid-template-columns: auto;">
                  <b-checkbox v-for="(status, index) of statusOptions" v-model="filters.statusOptions"
                    :key="index" :native-value="status">
                      <span>{{ enumSubmissionStatus[status] }}</span>
                  </b-checkbox>
                </div>
              </div>

              <div class="block is-flex is-flex-direction-column">
                <label for="repos" class="has-text-weight-bold has-space-bottom">Repository</label>
                <div id="repos" class="is-grid" style="grid-template-columns: auto auto;">
                  <b-checkbox v-for="(repo, index) of repoOptions" v-model="filters.repoOptions"
                    :key="index" :native-value="repo">
                      <span>{{ enumRepositories[repo] }}</span>
                  </b-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="level is-align-items-center">
          <h3 class="title is-3 is-marginless">{{ submissions.length }} Total Submissions</h3>
          <p v-if="isAnyFilterAcitve" class="has-text-mute">{{ filteredSubmissions.length }} Results</p>
        </div>
        <article class="panel">
          <div class="panel-heading">
            <div class="table-header">
              <div class="level">
                <b-button size="is-medium">Export Submissions</b-button>
                <hr class="is-hidden-tablet">
                <div class="is-flex is-align-items-center">
                  <span class="has-text-weight-bold has-space-right">Sort</span>
                  <b-field>
                    <b-select size="is-medium" v-model="currentSort.defaultSort">
                      <option v-for="sort in sortOptions" :value="sort" :key="sort">{{ enumSubmissionSorts[sort] }}</option>
                    </b-select>

                    <b-select size="is-medium" v-model="currentSort.defaultSortDirection">
                      <option v-for="direction in sortDirectionOptions" :value="direction" :key="direction">{{ enumSortDirections[direction] }}</option>
                    </b-select>
                  </b-field>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-block">
            <b-table :data="filteredSubmissions" :show-header="false" paginated :per-page="10" pagination-position="both" ref="submissionsTable"
              :defaultSort="currentSort.defaultSort" :defaultSortDirection="currentSort.defaultSortDirection" class="is-flex-grow-1">
              <b-table-column field="title" label="Title" v-slot="props" :sortable="true" :visible="false">
                {{ props.row.title }}
              </b-table-column>

              <b-table-column field="authors" label="Authors" v-slot="props" :visible="false">
                {{ props.row.authors.join(', ') }}
              </b-table-column>

              <b-table-column field="repository" label="Submission Repository" v-slot="props" :sortable="true" :visible="false">
                {{ props.row.repository }}
              </b-table-column>

              <b-table-column field="date" label="Submission Date" v-slot="props" :sortable="true" :visible="false">
                {{ props.row.date.toLocaleDateString() }}
              </b-table-column>

              <b-table-column field="status" label="Status" v-slot="props" :visible="false">
                {{ props.row.status }}
              </b-table-column>

              <b-table-column field="identifier" label="Identifier" v-slot="props" :visible="false">
                {{ props.row.identifier }}
              </b-table-column>

              <b-table-column v-slot="props">
                <div class="is-flex is-flex-direction-column is-align-items-flex-start">
                  <h4 class="is-size-4 has-text-weight-bold block">Title: {{ props.row.title }}</h4>
                  <p class="has-text-left"><b>Authors: </b>{{ props.row.authors.join(', ')}}</p>
                  <p class="has-text-left"><b>Submission Repository: </b>{{ props.row.repository }}</p>
                  <p class="has-text-left"><b>Submission Date: </b>{{ props.row.date.toLocaleDateString() }}</p>
                  <p class="has-text-left"><b>Status: </b>{{ props.row.status }}</p>
                  <p class="has-text-left"><b>Identifier: </b>{{ props.row.identifier }}</p>
                </div>
              </b-table-column>

              <b-table-column>
                <div class="is-flex is-flex-direction-column is-align-items-flex-start is-flex-grow-1">
                  <b-button class="block" expanded size="is-medium" type="is-primary">View Record In Repository</b-button>
                  <b-button class="block" expanded size="is-medium">Edit Submission</b-button>
                  <b-button class="block" expanded size="is-medium">Update Record</b-button>
                </div>
              </b-table-column>

              <template #empty>
                <div class="has-text-centered">
                  <b-loading :is-full-page="false" :active="isFetching" />
                  <template v-if="!isFetching">No records</template>
                </div>
              </template>
            </b-table>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Ref, Watch } from 'vue-property-decorator'
  import { EnumRepositories, EnumSubmissionStatus, ISubmission, EnumSubmissionSorts, EnumSortDirections } from '@/components/submissions/types'
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
      repoOptions: string[]
    } = { statusOptions: [], repoOptions: [] }

    protected enumSubmissionStatus = EnumSubmissionStatus
    protected enumRepositories = EnumRepositories
    protected enumSubmissionSorts = EnumSubmissionSorts
    protected enumSortDirections = EnumSortDirections

    protected get isFetching() {
      return Submission.$state.isFetching
    }

    protected get statusOptions() {
      return Object.keys(EnumSubmissionStatus)
    }

    protected get repoOptions() {
      return Object.keys(EnumRepositories)
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

    protected get filteredSubmissions() {
      let data = Submission.all()
      const filteredStatus = this.filters.statusOptions.map(s => EnumSubmissionStatus[s])
      const filteredRepos = this.filters.repoOptions.map(r => EnumRepositories[r])

      return data.filter((d) => {
        if (filteredStatus.length) {
          if (!filteredStatus.includes(d.status)) {
            return false
          }
        }

        if (filteredRepos.length) {
          if (!filteredRepos.includes(d.repository)) {
            return false
          }
        }

        return true
      })
    }

    created() {
      Submission.fetchSubmissions()
    }

    @Watch('currentSort', { deep: true })
    protected onDefaultSortChanged(newSort, oldSort) {
      this.$nextTick(() => {
        this.submissionsTable.initSort()
      })
    }
  }
</script>

<style lang="scss" scoped>
  /*.cz-submissions--header {
    /deep/ select {
      width: 20rem;
    }

    /deep/ input {
      max-width: 40rem;
    }
  }*/

  #filters {
    max-width: 60rem;

    .is-grid {
      align-items: flex-start;
    }

    /deep/ .checkbox .control-label > span {
      white-space: nowrap;
    }

    .b-checkbox {
      margin: 0 2rem 1rem 0;
    }
  }

  /deep/ table td {
    padding: 2rem;
  }

  .panel-block {
    font-size: 1.4rem;

    /deep/ .table-mobile-sort {
      display: none;
    }

    /*.control-label
    /deep/ .table-wrapper.has-mobile-cards {

    }*/
  }
</style>
