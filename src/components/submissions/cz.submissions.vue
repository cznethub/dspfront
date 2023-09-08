<template>
  <div class="cz-submissions">
    <div class="cz-submissions--header">
      <div class="text-h4">My Submissions</div>
      <v-divider class="mb-2" />
      <div>
        <div class="d-flex align-sm-center flex-column flex-sm-row">
          <div
            v-if="!isFetching && submissions.length"
            class="d-flex flex-column flex-sm-row"
          >
            <v-text-field
              id="my_submissions_search"
              class="ma-1 my-2 my-sm-0"
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
              class="ma-1 my-2 my-sm-0"
              small-chips
              deletable-chips
              clearable
              label="Repository"
              hide-details
              chips
              multiple
              dense
              outlined
            >
              <template v-slot:item="data">
                <v-list-item-action>
                  <v-icon v-if="data.attrs.inputValue"
                    >mdi-checkbox-marked</v-icon
                  >
                  <v-icon v-else>mdi-checkbox-blank-outline</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{
                      repoMetadata[data.item].dropdownName ||
                      repoMetadata[data.item].name
                    }}
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
              <v-btn color="primary" rounded block>
                <v-icon>mdi-plus</v-icon>
                New Submission
              </v-btn>
            </template>

            <v-card color="secondary">
              <v-card-text>
                <template v-for="repo of supportedRepoMetadata">
                  <v-tooltip :key="repo.name" left transition="fade">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="mx-0 my-4"
                        v-if="!repo.isDisabled"
                        @click="submitTo(repo)"
                        v-on="on"
                        v-bind="attrs"
                        block
                      >
                        {{ repo.name }}
                      </v-btn>
                    </template>
                    <span>{{ repo.submitTooltip }}</span>
                  </v-tooltip>
                </template>

                <v-tooltip left transition="fade">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      class="mx-0 my-4"
                      v-if="!externalRepoMetadata.isDisabled"
                      @click="openRegisterDatasetDialog"
                      v-on="on"
                      v-bind="attrs"
                      block
                    >
                      {{ externalRepoMetadata.name }}
                    </v-btn>
                  </template>
                  <span>{{ externalRepoMetadata.submitTooltip }}</span>
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
              :sort-by="
                sortBy.key ||
                Object.keys(enumSubmissionSorts).find(
                  (k) => enumSubmissionSorts[k] === sortBy
                )
              "
              :sort-desc="sortDesc"
              item-key="identifier"
              hide-default-footer
            >
              <template v-slot:header>
                <div elevation="0" class="has-bg-light-gray pa-4">
                  <div
                    class="d-flex justify-space-between full-width flex-column flex-md-row"
                  >
                    <v-btn
                      class="mb-md-0 mb-4"
                      rounded
                      @click="exportSubmissions"
                      :disabled="!filteredSubmissions.length"
                      >Export Submissions</v-btn
                    >
                    <v-spacer></v-spacer>
                    <div class="sort-controls d-flex flex-column flex-sm-row">
                      <v-select
                        id="sort-by"
                        :items="sortOptions"
                        v-model="sortBy"
                        item-text="label"
                        return-object
                        class="mr-1 sort-control my-md-0 my-2"
                        outlined
                        dense
                        hide-details="auto"
                        label="Sort by"
                      />

                      <v-select
                        id="sort-order"
                        :items="sortDirectionOptions"
                        v-model="sortDirection"
                        item-text="label"
                        return-object
                        class="sort-control my-md-0 my-2"
                        outlined
                        dense
                        hide-details="auto"
                        label="Order"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:default="{ items }">
                <v-divider />
                <div
                  v-for="(item, index) in items"
                  :id="`submission-${index}`"
                  :key="index"
                >
                  <div
                    class="table-item d-flex justify-space-between flex-column flex-md-row"
                  >
                    <div class="flex-grow-1 mr-4">
                      <table
                        class="text-body-1"
                        :class="{ 'is-xs-small': $vuetify.breakpoint.xs }"
                      >
                        <tr>
                          <td
                            colspan="2"
                            :id="`sub-${index}-title`"
                            class="text-h6 title"
                          >
                            {{ item.title }}
                          </td>
                        </tr>
                        <tr v-if="item.authors.length">
                          <th class="pr-4 body-2">Authors:</th>
                          <td>{{ item.authors.join(" | ") }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4 body-2">Submission Repository:</th>
                          <td>{{ getRepositoryName(item) }}</td>
                        </tr>
                        <tr>
                          <th class="pr-4 body-2">Submission Date:</th>
                          <td :id="`sub-${index}-date`">
                            {{ getDateInLocalTime(item.date) }}
                          </td>
                        </tr>
                        <tr>
                          <th class="pr-4 body-2">Identifier:</th>
                          <td>{{ item.identifier }}</td>
                        </tr>
                        <tr
                          v-if="
                            item.repository === enumRepositoryKeys.hydroshare
                          "
                        >
                          <th class="pr-4 body-2">Type:</th>
                          <td>{{ getItemResourceType(item) }}</td>
                        </tr>
                        <tr
                          v-if="
                            item.metadata.status &&
                            item.repository === enumRepositoryKeys.earthchem
                          "
                        >
                          <th class="pr-4 body-2">Status:</th>

                          <td>
                            <v-chip
                              v-if="item.metadata.status !== 'incomplete'"
                              color="orange"
                              small
                              outlined
                            >
                              <v-icon left small>mdi-lock</v-icon>
                              {{ item.metadata.status }}
                            </v-chip>

                            <v-chip v-else small outlined>
                              <v-icon left small>mdi-pencil</v-icon>
                              {{ item.metadata.status }}
                            </v-chip>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div class="d-flex flex-column mt-4 mt-md-0 actions">
                      <v-btn
                        :id="`sub-${index}-view`"
                        :href="item.url"
                        target="_blank"
                        color="blue-grey lighten-4"
                        rounded
                      >
                        <v-icon class="mr-1">mdi-open-in-new</v-icon> View In
                        Repository
                      </v-btn>
                      <v-btn
                        :id="`sub-${index}-view`"
                        @click="goToViewSubmission(item)"
                        rounded
                      >
                        <v-icon class="mr-1">mdi-file-document-outline</v-icon>
                        View
                      </v-btn>
                      <v-btn
                        v-if="
                          !(isItemHsCollection(item) || isItemPublished(item))
                        "
                        :id="`sub-${index}-edit`"
                        @click="goToEditSubmission(item)"
                        rounded
                      >
                        <v-icon class="mr-1">mdi-pencil-outline</v-icon> Edit
                      </v-btn>
                      <v-btn
                        :id="`sub-${index}-update`"
                        v-if="!repoMetadata[item.repository]?.isExternal"
                        @click="onUpdateRecord(item)"
                        :disabled="
                          isUpdating[`${item.repository}-${item.identifier}`]
                        "
                        rounded
                      >
                        <v-icon
                          v-if="
                            isUpdating[`${item.repository}-${item.identifier}`]
                          "
                          >fas fa-circle-notch fa-spin</v-icon
                        >
                        <v-icon v-else>mdi-sync</v-icon
                        ><span class="ml-1">
                          {{
                            isUpdating[`${item.repository}-${item.identifier}`]
                              ? "Updating Record..."
                              : "Update Record"
                          }}</span
                        >
                      </v-btn>
                      <v-btn
                        :id="`sub-${index}-delete`"
                        @click="
                          onDelete(
                            item,
                            repoMetadata[item.repository]?.isExternal
                          )
                        "
                        :disabled="isDeleteButtonDisabled(item)"
                        rounded
                      >
                        <v-icon
                          v-if="
                            isDeleting[`${item.repository}-${item.identifier}`]
                          "
                          >fas fa-circle-notch fa-spin</v-icon
                        >
                        <v-icon v-else>mdi-delete-outline</v-icon
                        ><span class="ml-1">
                          {{
                            isDeleting[`${item.repository}-${item.identifier}`]
                              ? "Deleting..."
                              : "Delete"
                          }}</span
                        >
                      </v-btn>
                    </div>
                  </div>
                  <v-divider />
                </div>
              </template>

              <template v-slot:footer>
                <div class="footer d-flex justify-space-between align-center">
                  <div>
                    <span class="grey--text text-body-2 mr-1"
                      >Items per page</span
                    >
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
                        @click="formerPage"
                        :disabled="page <= 1"
                      >
                        <v-icon>mdi-chevron-left</v-icon>
                      </v-btn>
                      <v-btn
                        small
                        fab
                        @click="nextPage"
                        :disabled="page >= numberOfPages"
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:no-data>
                <div class="text-subtitle-1 text--secondary ma-4">
                  You don't have any submissions that match the selected
                  criteria.
                </div>
              </template>

              <template v-slot:no-results>
                <div class="text-subtitle-1 text--secondary ma-4">
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
          <v-icon style="font-size: 6rem" class="mb-4"
            >mdi-text-box-remove</v-icon
          >
          You have not created any submissions yet
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
          <p>
            This action will delete the metadata for this submission in the data
            submission Portal.
          </p>
          <v-checkbox
            v-if="!deleteDialogData.isExternal"
            v-model="alsoDeleteInRepository"
            color="red"
            label="Also attempt to delete this resource and its content files from the repository. If the resource is permanently published (i.e., it has been assigned a DOI), we will not be able to remove it from the repository."
            hide-details
          >
          </v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="dialog-cancel"
            @click="isDeleteDialogActive = false"
            text
          >
            Cancel
          </v-btn>

          <v-btn
            class="dialog-confirm"
            @click="
              isDeleteDialogActive = false;
              onDeleteSubmission();
            "
            color="red darken-1"
            text
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
import { Component, Ref } from "vue-property-decorator";
import {
  ISubmission,
  EnumSubmissionSorts,
  EnumSortDirections,
  IRepository,
  EnumRepositoryKeys,
} from "@/components/submissions/types";
import { repoMetadata } from "@/components/submit/constants";
import { mixins } from "vue-class-component";
import { ActiveRepositoryMixin } from "@/mixins/activeRepository.mixin";
import { Subscription } from "rxjs";
import {
  itemsPerPageArray,
  sortDirectionsOverrides,
} from "@/components/submissions/constants";
import { getRepositoryFromKey } from "@/constants";
import CzRegisterDatasetDialog from "@/components/register-dataset/cz.register-dataset-dialog.vue";
// import { formatDistanceToNow } from 'date-fns'
import Submission from "@/models/submission.model";
import Repository from "@/models/repository.model";
import User from "@/models/user.model";
import { isRepositoryAuthorized } from "@/util";

@Component({
  name: "cz-submissions",
  components: { CzRegisterDatasetDialog },
})
export default class CzSubmissions extends mixins<ActiveRepositoryMixin>(
  ActiveRepositoryMixin
) {
  @Ref("registerDatasetDialog") registerDatasetDialog!: InstanceType<
    typeof CzRegisterDatasetDialog
  >;
  protected isUpdating: { [key: string]: boolean } = {};
  protected isDeleting: { [key: string]: boolean } = {};
  protected isDeleteDialogActive = false;
  protected deleteDialogData: {
    submission: ISubmission;
    isExternal: boolean;
  } | null = null;
  protected alsoDeleteInRepository = false;

  protected filters: {
    repoOptions: string[];
    searchStr: string;
  } = { repoOptions: [], searchStr: "" };

  protected itemsPerPageArray = itemsPerPageArray;
  protected page = 1;
  protected repoMetadata = repoMetadata;
  protected enumRepositoryKeys = EnumRepositoryKeys;
  protected enumSubmissionSorts = EnumSubmissionSorts;
  protected enumSortDirections = EnumSortDirections;
  protected sortDirectionsOverrides = sortDirectionsOverrides;
  protected currentItems = [];
  protected loggedInSubject = new Subscription();

  protected get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata).map((r) => repoMetadata[r]);
  }

  protected get supportedRepoMetadata() {
    return this.repoCollection.filter((r) => !r.isExternal && r.isSupported);
  }

  protected get externalRepoMetadata() {
    return this.repoCollection.find((r) => r.isExternal);
  }

  protected get sortBy() {
    return Submission.$state.sortBy;
  }

  protected set sortBy(sortBy: { key: string; label: string }) {
    Submission.commit((state) => {
      state.sortBy = sortBy;
    });

    this._loadSortDirection();
  }

  protected get sortDirection(): { key: string; label: string } {
    return Submission.$state.sortDirection;
  }

  protected set sortDirection(sortDirection: { key: string; label: string }) {
    Submission.commit((state) => {
      state.sortDirection = sortDirection;
    });
  }

  protected get itemsPerPage() {
    return Submission.$state.itemsPerPage;
  }

  protected set itemsPerPage(itemsPerPage: number) {
    Submission.commit((state) => {
      state.itemsPerPage = itemsPerPage;
    });
  }

  protected get isFetching() {
    return Submission.$state.isFetching;
  }

  protected get repoOptions() {
    return Object.keys(repoMetadata).filter(
      (key) => repoMetadata[key].isSupported
    );
  }

  protected get sortOptions() {
    return Object.keys(EnumSubmissionSorts).map((key) => {
      return { key: key, label: EnumSubmissionSorts[key] };
    });
  }

  protected get isLoggedIn() {
    return User.$state.isLoggedIn;
  }

  protected get sortDirectionOptions() {
    return Object.keys(EnumSortDirections).map((key) => {
      return {
        key,
        label:
          sortDirectionsOverrides[this.sortBy.key]?.[key] ||
          EnumSortDirections[key],
      };
    });
  }

  protected get isAnyFilterAcitve() {
    return Object.keys(this.filters).find(
      (key) => this.filters[key] && this.filters[key].length
    );
  }

  protected get filteredSubmissions() {
    if (this.filters.repoOptions.length) {
      return Submission.all().filter((s) =>
        this.filters.repoOptions.includes(s.repository)
      );
    }

    return Submission.all();
  }

  protected get submissions(): ISubmission[] {
    return Submission.all();
  }

  protected get repoName(): string {
    if (this.deleteDialogData) {
      return (
        getRepositoryFromKey(this.deleteDialogData.submission.repository)
          ?.name || ""
      );
    }

    return "";
  }

  protected get numberOfPages() {
    if (this.isAnyFilterAcitve) {
      return Math.ceil(this.currentItems.length / this.itemsPerPage);
    }
    return Math.ceil(this.submissions.length / this.itemsPerPage);
  }

  protected get sortDesc(): boolean {
    return this.sortDirection.key === "desc";
  }

  created() {
    if (User.$state.isLoggedIn) {
      Submission.fetchSubmissions();
    }

    this.loggedInSubject = User.loggedIn$.subscribe(() => {
      Submission.fetchSubmissions();
    });

    this._loadSortDirection();
  }

  beforeDestroy() {
    this.loggedInSubject.unsubscribe();
  }

  protected nextPage() {
    if (this.page + 1 <= this.numberOfPages) this.page += 1;
  }

  protected formerPage() {
    if (this.page - 1 >= 1) this.page -= 1;
  }

  protected goToEditSubmission(submission: ISubmission) {
    const repo: IRepository = repoMetadata[submission.repository];
    this.$router.push({
      name: "submit.repository",
      params: { repository: repo.key, id: submission.identifier },
    });
  }

  protected goToViewSubmission(submission: ISubmission) {
    const repo: IRepository = repoMetadata[submission.repository];
    this.$router.push({
      name: "view-submission",
      params: { repository: repo.key, id: submission.identifier },
    });
  }

  protected getDateInLocalTime(date: number): string {
    const offset = new Date(date).getTimezoneOffset() * 60 * 1000;
    // TODO: subtracting offset because db stored dates seem to have the time shifted
    const localDateTime = date - offset;
    const localizedDate = new Date(localDateTime).toLocaleString();
    // const ago = formatDistanceToNow(new Date(localDateTime), { addSuffix: true })
    return localizedDate;
  }

  protected openRegisterDatasetDialog() {
    this.registerDatasetDialog.active = true;
  }

  protected async onUpdateRecord(submission: ISubmission) {
    this.$set(
      this.isUpdating,
      `${submission.repository}-${submission.identifier}`,
      true
    );
    await Repository.refetchSubmission(
      submission.identifier,
      submission.repository
    );
    this.$set(
      this.isUpdating,
      `${submission.repository}-${submission.identifier}`,
      false
    );
  }

  protected exportSubmissions() {
    const parsedSubmissions = this.filteredSubmissions.map((s) => {
      return {
        authors: s.authors.join("; "),
        date: new Date(s.date).toISOString(),
        title: s.title,
        repository: this.getRepositoryName(s),
        url: s.url,
      };
    });

    const columnLabels = [
      "Authors",
      "Publication Date",
      "Title",
      "Repository",
      "URL",
    ];

    const headerRow = columnLabels.join(",") + "\n";
    const rows = parsedSubmissions.map((s) => {
      return Object.keys(s).map((key) => `"${s[key]}"`);
    });

    const csvContent = headerRow + rows.map((c) => c.join(",")).join("\n");

    // Download as CSV
    const filename = `${this.$t(`footer.orgName`)}_submissions.csv`;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  protected isDeleteButtonDisabled(item) {
    return this.isDeleting[`${item.repository}-${item.identifier}`];
  }

  protected isItemHsCollection(submission: ISubmission) {
    return (
      submission.repository === EnumRepositoryKeys.hydroshare &&
      submission.metadata.type === "CollectionResource"
    );
  }

  protected isItemPublished(submission): boolean {
    if (submission.repository === EnumRepositoryKeys.hydroshare) {
      return !!submission?.metadata.published;
    } else if (submission.repository === EnumRepositoryKeys.earthchem) {
      return submission?.metadata.status === "published";
    }

    return false;
  }

  protected onDelete(submission: ISubmission, isExternal: boolean) {
    this.deleteDialogData = { submission, isExternal };
    this.alsoDeleteInRepository = false; // we want it unchecked initially
    this.isDeleteDialogActive = true;
  }

  protected async onDeleteSubmission() {
    this.$set(
      this.isDeleting,
      `${this.deleteDialogData?.submission.repository}-${this.deleteDialogData?.submission.identifier}`,
      true
    );

    if (this.deleteDialogData) {
      const deleteInRepo =
        !this.deleteDialogData.isExternal && this.alsoDeleteInRepository;

      if (deleteInRepo) {
        // Check that the user has authorized the selected repository
        if (
          !isRepositoryAuthorized(this.deleteDialogData.submission.repository)
        ) {
          this.$set(
            this.isDeleting,
            `${this.deleteDialogData?.submission.repository}-${this.deleteDialogData?.submission.identifier}`,
            false
          );

          this.authorizedSubject = Repository.authorized$.subscribe(
            async (repositoryKey: EnumRepositoryKeys) => {
              // try again when the repository has been authorized
              await this.onDeleteSubmission();
            }
          );
          return;
        }
      }

      await Repository.deleteSubmission(
        this.deleteDialogData.submission.identifier,
        this.deleteDialogData.submission.repository,
        deleteInRepo
      );
    }

    this.$set(
      this.isDeleting,
      `${this.deleteDialogData?.submission.repository}-${this.deleteDialogData?.submission.identifier}`,
      false
    );

    this.deleteDialogData = null;
  }

  protected getRepositoryName(item: ISubmission) {
    // For external submissions, we return the provider name instead
    if (item.repository === EnumRepositoryKeys.external) {
      return item.metadata.provider?.name || "";
    }

    return repoMetadata[item.repository]
      ? repoMetadata[item.repository].name
      : "";
  }

  protected getItemResourceType(item: ISubmission) {
    // For hydroshare submissions, get the resource type
    if (item.repository === EnumRepositoryKeys.hydroshare) {
      if (item.metadata.type === "CollectionResource") {
        return "Collection";
      } else return "Resource";
    }
    return "";
  }

  /** Use this function to load the correct sort option in case we have mutaded the entries to override the labels */
  private _loadSortDirection() {
    const selectedOption = this.sortDirectionOptions.find(
      (s) => s.key === this.sortDirection.key
    );
    if (selectedOption) {
      this.sortDirection = selectedOption;
    }
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
