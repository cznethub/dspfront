<template>
  <v-card
    :id="`${repo.name.replaceAll(` `, ``)}-card`"
    class="cz-recommendation-card"
    :disabled="repo.isDisabled"
    :outlined="!repo.isSupported?.form"
    :flat="!repo.isSupported?.form"
    :variant="repo.isSupported?.form ? 'elevated' : 'outlined'"
    border="solid thin"
  >
    <v-card-title class="bg-grey-lighten-4">
      {{ repo.name }}
    </v-card-title>
    <v-divider />

    <v-list-item three-line class="flex-column flex-md-row">
      <div class="d-flex justify-space-between pa-2">
        <div>
          <div class="text-body-1 text-medium-emphasis">
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
        v-if="repo.isSupported?.form"
        :disabled="repo.isComingSoon"
        variant="text"
        color="primary"
        @click="submitTo(repo)"
      >
        Submit to {{ repo.name }}
      </v-btn>
      <v-btn variant="text" :href="repo.url" target="_blank" prepend-icon="mdi-open-in-new">
        Visit {{ repo.name }}
      </v-btn>
      <v-btn
        v-if="repo.isSupported?.form"
        variant="text"
        :href="repo.supportUrl"
        target="_blank"
        prepend-icon="mdi-open-in-new"
      >
        Learn more about
        {{ repo.name }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import type { IRepository } from '~/components/submissions/types'
import { Component, mixins, Prop, toNative } from 'vue-facing-decorator'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'

@Component({
  name: 'cz-recommendation-card',
  components: {},
})
class CzRecommendationCard extends mixins(ActiveRepositoryMixin) {
  @Prop({ required: true }) repo!: IRepository
  @Prop() hideLogo!: boolean
}
export default toNative(CzRecommendationCard)
</script>

<style lang="scss" scoped>
.v-card {
  height: 100%;

  .repo-name {
    word-break: break-word;
  }
}
</style>
