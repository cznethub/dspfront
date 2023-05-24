<template>
  <div class="cz-repository-submit-card">
    <v-hover :key="repo.key">
      <template #default="{ hover }">
        <v-card 
          :id="repo.name.replaceAll(` `, ``) + `-card`"
          :disabled="repo.isDisabled"
          :class="`elevation-${ hover ? 12 : 2 }`"
          class="has-cursor-pointer transition-swing"
        >
          <v-icon v-if="!repo.isSupported || repo.isComingSoon" class="open-in-new">mdi-open-in-new</v-icon>
          <template v-if="!hideLogo">
            <v-card-title v-if="!repo.isExternal" class="v-card-media justify-center">
              <div class="repo-logo" :style="{'background-image':`url(${repo.logoSrc})`}"></div>
            </v-card-title>

            <v-card-title v-else class="v-card-media justify-center">
              <v-icon>mdi-text-box-plus</v-icon>
            </v-card-title>
          </template>

          <v-card-title>
            <div class="text-h4 repo-name">{{ repo.name }}</div>
          </v-card-title>

          <v-card-text class="text--secondary">
            <div class="text-subtitle-1">{{ repo.description }}</div>
            
            <template v-if="repo.isComingSoon">
              <v-divider class="has-space-top has-space-bottom" />
              <v-chip>CzNet support coming soon...</v-chip>
            </template>
          </v-card-text>
        </v-card>
      </template>
    </v-hover>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-facing-decorator'
  import { IRepository } from '../submissions/types'

  @Component({
    name: 'cz-repository-submit-card',
    components: { },
  })
  export default class CzRepositorySubmitCard extends Vue {
    @Prop({ required: true }) repo!: IRepository
    @Prop() hideLogo!: boolean
  }
</script>

<style lang="scss" scoped>
  ::v-deep .v-card-media {
    background: linear-gradient(135deg, #f1f3f5 0%, #cfd8dc 100%);
    height: 10rem; 
    padding: 2rem;

    img {
      height: 100%;
      flex: 0;
    }

    .v-icon {
      font-size: 7rem;
    }

    .repo-logo {
      width: 100%;
      height: 100%;
      background-position: center center;
      background-size: contain;
      background-repeat: no-repeat;
    }
  }

  .v-icon.open-in-new {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.5rem;
  }

  .v-card {
    height: 100%;

    .repo-name {
      word-break: break-word;
      width: calc(100% - 2rem);
    }
  }
</style>
