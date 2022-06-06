<template>
  <v-card>
    <v-sheet class="pa-4 d-flex align-center has-bg-light-gray primary lighten-4 text-subtitle-1">
      Aggregations
    </v-sheet>
    <v-card-text>
      <v-card flat outlined>
        <v-data-table
          @current-items="currentItems = $event"
          @click:row="onRowClick"
          :headers="headers"
          :items="aggregations"
          sort-by="title"
          sort-desc
          item-key="id"
          hide-default-footer
        >

          <!-- <template v-slot:item.date="{ item }">
            {{ (new Date(item.date)).toLocaleString() }}
          </template> -->
        </v-data-table>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator"
import {
  ISubmission,
  IRepository,
} from "@/components/submissions/types"
import { repoMetadata } from "@/components/submit/constants"
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'
import { Subscription } from "rxjs"
import Submission from "@/models/submission.model"
import User from "@/models/user.model"

@Component({
  name: "cz-aggregations-table",
  components: { },
})
export default class CzAggregationsTable extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  protected isUpdating: { [key: string]: boolean } = {}
  protected isDeleting: { [key: string]: boolean } = {}

  @Prop() aggregations!: any[]
  
  protected repoMetadata = repoMetadata
  protected loggedInSubject = new Subscription()
  protected headers = [
    { text: 'Type', value: 'type', sortable: true },
    { text: 'Title', value: 'title', sortable: true },
  ]

  protected get isFetching() {
    return Submission.$state.isFetching
  }

  protected get isLoggedIn() {
    return User.$state.isLoggedIn
  }

  created() {
    // console.log(this.aggregations)
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe()
  }

  protected onRowClick(aggregation: any, item) {
    this.goToEditSubmission(aggregation)
  }

  protected goToEditSubmission(aggregation: any) {
    const repo: IRepository = repoMetadata['hydroshare']
    this.$router.push({
      name: "submit.repository",
      params: { repository: repo.key, id: aggregation.id },
    })
  }
}
</script>

<style lang="scss" scoped>
.v-card {
  margin: 0;
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
</style>
