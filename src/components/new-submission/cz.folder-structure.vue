<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 primary lighten-2">
      <v-btn @click="newFolder" fab small text><v-icon>mdi-folder</v-icon></v-btn>
      <v-btn @click="deleteItem" fab small text><v-icon>mdi-delete</v-icon></v-btn>
      <v-btn @click="renameItem" fab small text><v-icon>mdi-pencil</v-icon></v-btn>
    </v-sheet>
    <v-card-text style="min-height: 10rem;">
      <v-treeview
        v-model="tree"
        :open="initiallyOpen"
        :items="rootDirectory.children"
        activatable
        item-key="name"
        open-on-click
        selection-type="independent"
      >
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="item.children" @click.native="onItemClick(item)">
            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <v-icon v-else @click.native="onItemClick(item)">
            {{ files[item.name.split('.').pop()] || files['txt'] }}
          </v-icon>
        </template>
        <template v-slot:label="{ item }">
          <v-text-field v-if="item.isRenaming" :value="item.name" @change="onRenamed(item, $event)" @keydown.enter="item.isRenaming = false" autofocus></v-text-field>
          <div v-else @click="onItemClick(item)">{{ item.name }}</div>
        </template>
      </v-treeview>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import CzNotification from "@/models/notifications.model"
import { Component, Vue, Prop } from "vue-property-decorator"

interface IFile {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
}

interface IFolder {
  name: string
  children: (IFile | IFolder)[]
  parent: IFolder | null
  isRenaming?: boolean
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
  protected selectedDirectoryItem!: IFolder | IFile
  protected rootDirectory: IFolder = { name: 'root', children: [], parent: null }
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

  created() {
    this.selectedDirectoryItem = this.rootDirectory
    // this.directoryItems = this.dropFiles.map((file) => {
    //   return {
    //     name: file.name
    //   } as IDirectoryItem
    // })
  }

  protected onItemClick(item: IFolder | IFile) {
    this.selectedDirectoryItem = item
  }

  protected onRenamed(item: IFile | IFolder, name: string) {
    if (name.trim()) {
      item.name = this.getAvailableName(name, item.parent as IFolder)
    }
    
    item.isRenaming = false
  }

  protected deleteItem() {
    const index = (this.selectedDirectoryItem.parent as IFolder).children.indexOf(this.selectedDirectoryItem)
    if (index >= 0) {
      const parent = this.selectedDirectoryItem.parent as IFolder
      parent.children.splice(index, 1)
      this.selectedDirectoryItem = parent
    }
  }

  protected renameItem() {
    
  }

  protected newFolder() {
    const newFolder = { name: 'New folder', children: [], parent: null, isRenaming: true } as IFolder
    if (this.selectedDirectoryItem.hasOwnProperty('children')) {
      // Selected item is a folder
      newFolder.parent = this.selectedDirectoryItem as IFolder
      newFolder.name = this.getAvailableName(newFolder.name, this.selectedDirectoryItem as IFolder);
      (this.selectedDirectoryItem as IFolder).children.push(newFolder)
    }
    else {
      // Selected item is a file
      newFolder.parent = this.selectedDirectoryItem.parent as IFolder
      newFolder.name = this.getAvailableName(newFolder.name, this.selectedDirectoryItem.parent as IFolder);
      (this.selectedDirectoryItem.parent as IFolder).children = [newFolder, ...this.rootDirectory.children]
    }
  }

  private getAvailableName(name: string, parent: IFolder): string {
    let availableName = name
    let nameAlreadyExists = parent.children.some((item: IFile | IFolder) => {
      return item.name === availableName
    })
    let counter = 1

    while(nameAlreadyExists) {
      availableName = `${name} (${counter})`
      nameAlreadyExists = (this.selectedDirectoryItem as IFolder).children.some((item: IFile | IFolder) => {
        return item.name === availableName
      })
      counter++
    }

    return availableName
  }
}
</script>

<style lang="scss" scoped>
</style>
