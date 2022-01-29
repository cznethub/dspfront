<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 primary lighten-2">
      <v-btn @click="newFolder" fab small text><v-icon>mdi-folder</v-icon></v-btn>
    </v-sheet>
    <v-card-text style="min-height: 10rem;">
      <v-treeview
        v-model="tree"
        :open="initiallyOpen"
        :items="items"
        activatable
        item-key="name"
        open-on-click
      >
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="item.type === 'folder'">
            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <v-icon v-else>
            {{ files[item.name.split('.').pop()] || files['txt'] }}
          </v-icon>
        </template>
      </v-treeview>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"

interface IDirectoryItem {
  name: string
  type?: 'folder' | 'file'
  children?: IDirectoryItem[]
}

@Component({
  name: "cz-folder-structure",
  components: {  },
})
export default class CzFolderStructure extends Vue {
  @Prop({ default: () => []}) dropFiles!: File[]
  protected initiallyOpen = ['public']
  protected files = {
    html: 'mdi-language-html5',
    js: 'mdi-nodejs',
    json: 'mdi-code-json',
    md: 'mdi-language-markdown',
    pdf: 'mdi-file-pdf',
    png: 'mdi-file-image',
    txt: 'mdi-file-document-outline',
    xls: 'mdi-file-excel',
  }
  protected tree = []
  // protected items: IDirectoryItem[] = [
  //   {
  //     name: 'public',
  //     type: 'folder',
  //     children: [
  //       {
  //         name: 'static',
  //         type: 'folder',
  //         children: [{
  //           name: 'logo.png',
  //         }],
  //       },
  //       {
  //         name: 'favicon.ico',
  //       },
  //       {
  //         name: 'index.html',
  //       },
  //     ],
  //   },
  //   {
  //     name: '.gitignore',
  //   },
  // ]

  protected get items(): IDirectoryItem[] {
    return this.dropFiles.map((file) => {
      return {
        name: file.name
      } as IDirectoryItem
    })
  }

  created() {
  }

  protected newFolder() {
    
  }
}
</script>

<style lang="scss" scoped>
</style>
