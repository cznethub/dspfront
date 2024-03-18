<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component({
  name: 'cz-about',
  components: {},
})
export default class CzAbout extends Vue {}
</script>

<template>
  <v-container class="cz-about d-flex full-height pa-0">
    <div
      id="panel-left"
      class="flex-grow-1 hidden-sm-and-down"
      :style="{
        'background-image':
          `linear-gradient(rgb(0 52 82 / 31%), rgba(0, 0, 0, 0)), url(${
            '/img/bg-4.png'
          })`,
      }"
    />
    <v-container id="panel-right" class="pa-8">
      <div class="text-h4">
        About the {{ $t("home.banner.title") }}
      </div>
      <a :href="`${$t('footer.orgLink')}`" target="_blank">{{
        $t("footer.orgLink")
      }}</a>
      <v-divider class="mb-2" />
      <p class="text-body-1">
        {{ $t("about.body[0]") }}
      </p>
      <p class="text-body-1">
        {{ $t("about.body[1]") }}
      </p>
    </v-container>
  </v-container>
</template>

<style lang="scss" scoped>
#panel-left {
  background-size: cover;
  flex: 3;
}

#panel-left {
  padding-top: 8rem;
  background-size: cover;
}

#panel-right {
  flex: 1;
  flex-direction: column;
}
</style>
