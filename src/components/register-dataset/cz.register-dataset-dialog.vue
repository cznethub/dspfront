<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { repoMetadata } from '~/components/submit/constants'
import type { IRepository } from '~/components/submissions/types'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'

@Component({
  name: 'cz-register-dataset-dialog',
  components: {},
  mixins: [ActiveRepositoryMixin],
})
export default class CzRegisterDatasetDialog extends Vue {
  public active = false

  protected get repoCollection(): IRepository[] {
    return Object.keys(repoMetadata).map(r => repoMetadata[r])
  }

  protected get supportedRepoMetadata() {
    return this.repoCollection.filter(r => !r.isExternal && r.isSupported)
  }

  protected get externalRepoMetadata() {
    return this.repoCollection.find(r => r.isExternal)
  }

  protected close() {
    this.$emit('close')
  }
}
</script>

<template>
  <v-dialog v-model="active" width="800">
    <v-card>
      <v-card-title>
        <div class="text-heading-4 mb-4">
          Register Dataset
        </div>
      </v-card-title>

      <v-card-subtitle class="text-body-1">
        What repository is the resource in?
      </v-card-subtitle>

      <v-card-text
        class="choice-container pb-8 gap-1"
        :class="{ 'is-xs-small': $vuetify.display.xs }"
      >
        <v-hover>
          <template #default="{ hover }">
            <v-card
              class="transition-swing"
              :to="{ path: 'register' }"
              :class="`elevation-${hover ? 2 : 0}`"
              outlined
            >
              <v-card-text class="d-flex align-items-center gap-1">
                <v-icon large color="#87AAAA">
                  mdi-link-plus
                </v-icon>
                <div>
                  <div class="text-overline mb-2 has-text-black">
                    SUPPORTED REPOSITORY
                  </div>
                  <div class="text-body-1">
                    Register an existing dataset from HydroShare, EarthChem, or
                    Zenodo
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>

        <v-hover>
          <template #default="{ hover }">
            <v-card
              class="transition-swing"
              :class="`elevation-${hover ? 2 : 0}`"
              outlined
              role="button"
              ripple
            >
              <v-card-text
                class="d-flex align-items-center gap-1"
                @click="
                  close();
                  submitTo(externalRepoMetadata);
                "
              >
                <v-icon large color="#C37B89">
                  mdi-text-box-plus
                </v-icon>
                <div>
                  <div class="text-overline mb-2 has-text-black">
                    OTHER
                  </div>
                  <div class="text-body-1">
                    Register a dataset from a different repository
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn @click="active = false">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.choice-container {
  display: grid;
  grid-template-columns: auto auto;

  &.is-xs-small {
    display: flex;
    flex-direction: column;
  }
}
</style>
