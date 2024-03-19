<script lang="ts">
import { Component, Prop, mixins } from 'vue-facing-decorator'
import type { IRepository } from '~/components/submissions/types'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'

@Component({
  name: 'cz-recommendation-card',
  components: {},
})
export default class CzRecommendationCard extends mixins(ActiveRepositoryMixin) {
  @Prop({ required: true }) repo!: IRepository
  @Prop() hideLogo!: boolean
}
</script>

<template>
  <v-card
    :id="`${repo.name.replaceAll(` `, ``)}-card`"
    class="cz-recommendation-card"
    :disabled="repo.isDisabled"
    :outlined="!repo.isSupported"
  >
    <v-card-title>
      {{ repo.name }}
    </v-card-title>
    <v-list-item three-line class="flex-column flex-md-row">
      <div class="d-flex justify-space-between">
        <div>
          <div class="text-subtitle-1 font-weight-light">
            {{ repo.description }}
          </div>
          <v-chip v-if="repo.isComingSoon" class="mt-2">
            {{ $t("footer.orgName") }} support coming soon...
          </v-chip>
        </div>
        <v-spacer />

        <v-img
          v-if="!hideLogo"
          min-width="25rem"
          height="3rem"
          :src="repo.logoSrc"
        />
      </div>
    </v-list-item>

    <v-divider />

    <v-card-actions class="d-flex flex-column flex-md-row flex-wrap-wrap">
      <v-btn
        v-if="repo.isSupported"
        :disabled="repo.isComingSoon"
        text
        color="primary"
        @click="submitTo(repo)"
      >
        Submit to {{ repo.name }}
      </v-btn>
      <v-btn text :href="repo.url" target="_blank">
        <v-icon left>
          mdi-open-in-new
        </v-icon>Visit {{ repo.name }}
      </v-btn>
      <v-btn
        v-if="repo.isSupported"
        text
        :href="repo.supportUrl"
        target="_blank"
      >
        <v-icon left>
          mdi-open-in-new
        </v-icon>Learn more about
        {{ repo.name }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.v-card {
  height: 100%;

  .repo-name {
    word-break: break-word;
  }
}
</style>
