<template>
  <v-dialog v-model="active" width="800">
    <v-card>
      <v-card-title>
        <div class="text-heading-4 mb-4">Register Dataset</div>
      </v-card-title>

      <v-card-subtitle class="text-body-1">
        What repository is the resource in?
      </v-card-subtitle>

      <v-card-text
        class="choice-container pb-8 gap-1"
        :class="{ 'is-xs-small': $vuetify.display.xs }"
      >
        <v-hover>
          <template #default="{ isHovering, props }">
            <v-card
              class="transition-swing"
              :to="{ name: 'register' }"
              :elevation="isHovering ? 4 : 2"
              v-bind="props"
              variant="elevated"
            >
              <v-card-text class="d-flex align-center gap-1">
                <v-icon size="3rem" color="#87AAAA"> mdi-link-plus </v-icon>
                <div>
                  <div class="text-overline mb-2 has-text-black">
                    SUPPORTED REPOSITORY
                  </div>
                  <div class="text-body-1 text-medium-emphasis">
                    Register an existing dataset from HydroShare, EarthChem, or
                    Zenodo
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-hover>

        <v-hover v-if="externalRepoMetadata">
          <template #default="{ isHovering, props }">
            <v-card
              class="transition-swing"
              :elevation="isHovering ? 4 : 2"
              v-bind="props"
              variant="elevated"
              role="button"
              ripple
            >
              <v-card-text
                class="d-flex align-center gap-1"
                @click="submitTo(externalRepoMetadata!)"
              >
                <v-icon size="3rem" color="#C37B89"> mdi-text-box-plus </v-icon>
                <div>
                  <div class="text-overline mb-2 has-text-black">OTHER</div>
                  <div class="text-body-1 text-medium-emphasis">
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
        <v-btn variant="elevated" @click="active = false"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { repoMetadata } from '~/components/submit/constants'
import type { IRepository } from '~/components/submissions/types'
import { useActiveRepository } from '~/composables/useActiveRepository'

const active = ref(false)

const { submitTo } = useActiveRepository()

const repoCollection = computed<IRepository[]>(() =>
  Object.keys(repoMetadata).map(r => repoMetadata[r]),
)

const externalRepoMetadata = computed<IRepository | undefined>(() =>
  repoCollection.value.find(r => r.isExternal),
)

defineExpose({ active })
</script>

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
