<template>
  <div class="cz-repository-submit-card">
    <v-hover :key="repo.key">
      <template v-slot:default="{ hover }">
        <v-card 
          @click.native="submitTo(repo)"
          :id="repo.name.replaceAll(` `, ``) + `-card`"
          :disabled="repo.isDisabled"
          :class="`elevation-${ hover ? 12 : 2 }`"
          class="has-cursor-pointer transition-swing"
          max-width="40rem"
        >

          <v-card-title v-if="!repo.isExternal" class="v-card-media justify-center">
            <img :src="repo.logoSrc" :alt="repo.name">
          </v-card-title>

          <v-card-title v-else class="v-card-media justify-center">
            <v-icon>mdi-text-box-plus</v-icon>
          </v-card-title>

          <v-card-title>
            <div class="text-h4">{{ repo.name }}</div>
          </v-card-title>

          <v-card-text class="text--secondary">
            <div class="text-subtitle-1">{{ repo.description }}</div>
            
            <template v-if="repo.isDisabled">
              <v-divider class="has-space-top has-space-bottom" />
              <v-chip>Coming soon...</v-chip>
            </template>
          </v-card-text>
        </v-card>
      </template>
    </v-hover>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator'
  import { IRepository } from '../submissions/types'
  import { mixins } from 'vue-class-component'
  import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'

  @Component({
    name: 'cz-submit',
    components: { },
  })
  export default class CzRepositorySubmitCard extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
    @Prop({ required: true }) repo!: IRepository
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
  }

  .v-card {
    height: 100%;
  }
</style>
