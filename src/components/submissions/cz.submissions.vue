<template>
  <div class="cz-submissions">
    <div class="cz-submissions--header">
      <div class="text-h4">My Submissions</div>
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

          <v-btn
            @click.enter="openRegisterDatasetDialog"
            color="primary"
            prepend-icon="mdi-text-box-plus"
          >
            Register Datasets
          </v-btn>
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
                    <div
                      class="sort-controls d-flex flex-column flex-sm-row gap-1"
                    >
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
                        <tbody>
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
                            <th class="pr-4 text-body-2">Authors:</th>
                            <td>{{ item.raw.authors.join(" | ") }}</td>
                          </tr>
                          <tr>
                            <th class="pr-4 text-body-2">
                              Submission Repository:
                            </th>
                            <td>{{ getRepositoryName(item.raw) }}</td>
                          </tr>
                          <tr>
                            <th class="pr-4 text-body-2">Submission Date:</th>
                            <td :id="`sub-${index}-date`">
                              {{ getDateInLocalTime(item.raw.date) }}
                            </td>
                          </tr>
                          <tr>
                            <th class="pr-4 text-body-2">Identifier:</th>
                            <td>{{ item.raw.identifier }}</td>
                          </tr>
                          <tr
                            v-if="
                              item.raw.repository ===
                              enumRepositoryKeys.hydroshare
                            "
                          >
                            <th class="pr-4 text-body-2">Type:</th>
                            <td>{{ getItemResourceType(item.raw) }}</td>
                          </tr>
                          <tr
                            v-if="
                              item.raw.metadata.status &&
                              item.raw.repository ===
                                enumRepositoryKeys.earthchem
                            "
                          >
                            <th class="pr-4 text-body-2">Status:</th>

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
                        </tbody>
                      </table>
                    </div>

                    <div class="d-flex flex-column mt-4 mt-md-0 actions">
                      <v-btn
                        :id="`sub-${index}-view`"
                        :href="item.raw.url"
                        target="_blank"
                        color="blue-grey-lighten-4"
                        rounded
                      >
                        <v-icon class="mr-1"> mdi-open-in-new </v-icon> View In
                        Repository
                      </v-btn>
                      <v-btn
                        v-if="
                          itemHasFormSupport(item.raw) &&
                          !isItemHsCollection(item.raw) &&
                          !isItemPublished(item.raw) &&
                          !isItemEclSubmitted(item.raw)
                        "
                        :id="`sub-${index}-edit`"
                        rounded
                        @click="goToEditSubmission(item.raw)"
                      >
                        <v-icon class="mr-1"> mdi-pencil-outline </v-icon> Edit
                      </v-btn>
                      <v-btn
                        v-if="!repoMetadata[item.raw.repository]?.isExternal"
                        :id="`sub-${index}-update`"
                        :disabled="
                          isUpdating[
                            `${item.raw.repository}-${item.raw.identifier}`
                          ]
                        "
                        rounded
                        @click="onUpdateRecord(item.raw)"
                      >
                        <v-icon
                          v-if="
                            isUpdating[
                              `${item.raw.repository}-${item.raw.identifier}`
                            ]
                          "
                        >
                          fas fa-circle-notch fa-spin
                        </v-icon>
                        <v-icon v-else> mdi-sync </v-icon
                        ><span class="ml-1">
                          {{
                            isUpdating[
                              `${item.raw.repository}-${item.raw.identifier}`
                            ]
                              ? "Updating Record..."
                              : "Update Record"
                          }}</span
                        >
                      </v-btn>
                      <v-btn
                        :id="`sub-${index}-delete`"
                        :disabled="isDeleteButtonDisabled(item.raw)"
                        rounded
                        @click="onDelete(item.raw)"
                      >
                        <v-icon
                          v-if="
                            isDeleting[
                              `${item.raw.repository}-${item.raw.identifier}`
                            ]
                          "
                        >
                          fas fa-circle-notch fa-spin
                        </v-icon>
                        <v-icon v-else> mdi-delete-outline </v-icon
                        ><span class="ml-1">
                          {{
                            isDeleting[
                              `${item.raw.repository}-${item.raw.identifier}`
                            ]
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

              <template #footer>
                <div class="footer d-flex justify-space-between align-center">
                  <div>
                    <span class="grey--text text-body-2 mr-1"
                      >Items per page</span
                    >

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
            v-if="!deleteDialogData.isExternal && !deleteDialogData.isPublished"
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

<script setup lang="ts">
import type { IRepository, ISubmission } from "~/components/submissions/types";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { Subscription } from "rxjs";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import CzRegisterDatasetDialog from "~/components/register-dataset/cz.register-dataset-dialog.vue";
import {
  itemsPerPageArray,
  sortDirectionsOverrides,
} from "~/components/submissions/constants";
import {
  EnumRepositoryKeys,
  EnumSortDirections,
  EnumSubmissionSorts,
} from "~/components/submissions/types";
import { repoMetadata } from "~/components/submit/constants";
import { useUserStore } from "~/stores/user.store";
import { useRepositoryStore } from "~/stores/repository.store";
import { useSubmissionStore } from "~/stores/submission.store";

const userStore = useUserStore();
const repositoryStore = useRepositoryStore();
const submissionStore = useSubmissionStore();
const router = useRouter();
const { t } = useI18n();

const registerDatasetDialog = ref<InstanceType<typeof CzRegisterDatasetDialog>>();

const isUpdating = reactive<Record<string, boolean>>({});
const isDeleting = reactive<Record<string, boolean>>({});
const isDeleteDialogActive = ref(false);
const deleteDialogData = ref<{
  submission: ISubmission;
  isExternal: boolean;
  isPublished: boolean;
} | null>(null);

const alsoDeleteInRepository = ref(false);
const filters = reactive<{ repository: string[]; searchStr: string }>({
  repository: [],
  searchStr: "",
});
const page = ref(1);
const enumRepositoryKeys = EnumRepositoryKeys;

let loggedInSubject = new Subscription();
let authorizedSubject = new Subscription();

const itemsPerPage = computed({
  get: () => submissionStore.itemsPerPage,
  set: (v: number) => { submissionStore.itemsPerPage = v },
});

const isFetching = computed(() => submissionStore.isFetching);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const sortBy = computed({
  get: () => submissionStore.sortBy,
  set: (v) => { submissionStore.sortBy = v },
});

const repoOptions = computed(() =>
  Object.keys(repoMetadata)
    .filter((key) => repoMetadata[key].isSupported)
    .map((key) => ({ key, label: repoMetadata[key].name })),
);

const sortOptions = computed(() =>
  Object.keys(EnumSubmissionSorts).map((key) => ({
    key,
    label: EnumSubmissionSorts[key as keyof typeof EnumSubmissionSorts],
  })),
);

const sortDirectionOptions = computed(() =>
  Object.keys(EnumSortDirections).map((key) => ({
    key,
    label:
      sortDirectionsOverrides[sortBy.value.key]?.[key as keyof typeof EnumSortDirections]
      || EnumSortDirections[key as keyof typeof EnumSortDirections],
  })),
);

const submissions = computed<ISubmission[]>(() => submissionStore.all);

const filteredSubmissions = computed(() => {
  if (filters.repository.length) {
    return submissions.value.filter((s) => filters.repository.includes(s.repository));
  }
  return submissions.value;
});

const isAnyFilterAcitve = computed(() =>
  Object.keys(filters).find((key) => (filters as any)[key]?.length),
);

const numberOfPages = computed(() =>
  isAnyFilterAcitve.value
    ? Math.ceil(filteredSubmissions.value.length / itemsPerPage.value)
    : Math.ceil(submissions.value.length / itemsPerPage.value),
);

function nextPage() {
  if (page.value + 1 <= numberOfPages.value) page.value += 1;
}

function formerPage() {
  if (page.value - 1 >= 1) page.value -= 1;
}

function openRegisterDatasetDialog() {
  if (registerDatasetDialog.value) registerDatasetDialog.value.active = true;
}

function goToEditSubmission(submission: ISubmission) {
  const repo: IRepository = repoMetadata[submission.repository];
  router.push({
    name: "register-data.repository",
    params: { repository: repo.key, id: submission.identifier },
  });
}

function getDateInLocalTime(date: number): string {
  const offset = new Date(date).getTimezoneOffset() * 60 * 1000;
  // TODO: subtracting offset because db stored dates seem to have the time shifted
  return new Date(date - offset).toLocaleString();
}

async function onUpdateRecord(submission: ISubmission) {
  const key = `${submission.repository}-${submission.identifier}`;
  isUpdating[key] = true;
  await repositoryStore.refetchSubmission(submission.identifier, submission.repository);
  isUpdating[key] = false;
}

function exportSubmissions() {
  const parsedSubmissions = filteredSubmissions.value.map((s) => ({
    authors: s.authors.join("; "),
    date: new Date(s.date).toISOString(),
    title: s.title,
    repository: getRepositoryName(s),
    url: s.url,
  }));

  const columnLabels = ["Authors", "Publication Date", "Title", "Repository", "URL"];
  const headerRow = `${columnLabels.join(",")}\n`;
  const rows = parsedSubmissions.map((s) =>
    Object.keys(s).map((key: string) => `"${(s as any)[key]}"`),
  );
  const csvContent = headerRow + rows.map((c) => c.join(",")).join("\n");
  const filename = `${t("footer.orgName")}_submissions.csv`;
  const element = document.createElement("a");
  element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function isDeleteButtonDisabled(submission: ISubmission) {
  return isDeleting[`${submission.repository}-${submission.identifier}`];
}

function isItemHsCollection(submission: ISubmission) {
  return (
    submission.repository === EnumRepositoryKeys.hydroshare
    && submission.metadata.type === "CollectionResource"
  );
}

function isItemPublished(submission: ISubmission): boolean {
  if (submission.repository === EnumRepositoryKeys.hydroshare)
    return !!submission?.metadata.published;
  else if (submission.repository === EnumRepositoryKeys.earthchem)
    return submission?.metadata?.status === "published";
  return false;
}

function isItemEclSubmitted(submission: ISubmission): boolean {
  return (
    submission.repository === EnumRepositoryKeys.earthchem
    && submission?.metadata.status === "submitted"
  );
}

function itemHasFormSupport(submission: ISubmission) {
  return repoMetadata[submission.repository]?.isSupported?.form;
}

function onDelete(submission: ISubmission) {
  deleteDialogData.value = {
    submission,
    isExternal:
      repoMetadata[submission.repository]?.isExternal
      || !repoMetadata[submission.repository]?.isSupported?.form
      || false,
    isPublished: isItemPublished(submission),
  };
  alsoDeleteInRepository.value = false;
  isDeleteDialogActive.value = true;
}

async function onDeleteSubmission() {
  const key = `${deleteDialogData.value?.submission.repository}-${deleteDialogData.value?.submission.identifier}`;
  isDeleting[key] = true;

  if (deleteDialogData.value) {
    const deleteInRepo = !deleteDialogData.value.isExternal && alsoDeleteInRepository.value;

    if (deleteInRepo) {
      const repo = deleteDialogData.value.submission.repository;
      if (repo !== EnumRepositoryKeys.external && !repositoryStore.getAccessToken(repo)) {
        repositoryStore.openAuthorizeDialog(repo);
        isDeleting[key] = false;
        authorizedSubject = repositoryStore.authorized$.subscribe(async () => {
          await onDeleteSubmission();
        });
        return;
      }
    }

    await repositoryStore.deleteSubmission(
      deleteDialogData.value.submission.identifier,
      deleteDialogData.value.submission.repository,
      deleteInRepo,
    );
  }

  isDeleting[key] = false;
  deleteDialogData.value = null;
}

function getRepositoryName(item: ISubmission) {
  if (item.repository === EnumRepositoryKeys.external)
    return item.metadata.provider?.name || "";
  return repoMetadata[item.repository] ? repoMetadata[item.repository].name : "";
}

function getItemResourceType(item: ISubmission) {
  if (item.repository === EnumRepositoryKeys.hydroshare) {
    return item.metadata.type === "CollectionResource" ? "Collection" : "Resource";
  }
  return "";
}

onMounted(() => {
  if (userStore.isLoggedIn) submissionStore.fetchSubmissions();
  loggedInSubject = userStore.loggedIn$.subscribe(() => {
    submissionStore.fetchSubmissions();
  });
});

onBeforeUnmount(() => {
  loggedInSubject.unsubscribe();
  authorizedSubject.unsubscribe();
});
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
