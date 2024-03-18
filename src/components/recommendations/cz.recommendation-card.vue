<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator'
import type { IRepository } from '~/components/submissions/types'
import { ActiveRepositoryMixin } from '~/mixins/activeRepository.mixin'

@Component({
  name: 'cz-recommendation-card',
  components: {},
  mixins: [ActiveRepositoryMixin],
})
export default class CzRecommendationCard extends Vue {
  @Prop({ required: true }) repo!: IRepository
  @Prop() hideLogo!: boolean
}
</script>

<template>
  <div class="cz-recommendation-card">
    <v-card
      :id="`${repo.name.replaceAll(` `, ``)}-card`"
      :disabled="repo.isDisabled"
      :outlined="!repo.isSupported"
    >
      <v-list-item three-line class="flex-column flex-md-row">
        <v-list-item-title class="text-h5 mb-1">
          {{
            repo.name
          }}
        </v-list-item-title>

        <div>
          <div class="text-subtitle-1 text--secondary">
            {{ repo.description }}
          </div>
          <v-chip v-if="repo.isComingSoon" class="mt-2">
            {{ $t("footer.orgName") }} support coming soon...
          </v-chip>
        </div>

        <v-list-item-avatar v-if="!hideLogo" tile width="300">
          <div
            class="repo-logo"
            :style="{ 'background-image': `url(${repo.logoSrc})` }"
          />
        </v-list-item-avatar>
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
  </div>
</template>

<style lang="scss" scoped>
.v-card {
  height: 100%;

  .repo-name {
    word-break: break-word;
  }

  .repo-logo {
    width: 100%;
    height: 100%;
    background-position: center center;
    background-size: contain;
    background-repeat: no-repeat;
  }
}
</style>
