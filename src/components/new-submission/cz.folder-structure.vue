<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 primary lighten-2 d-flex align-center">
      <v-btn @click="newFolder" fab small text><v-icon>mdi-folder</v-icon></v-btn>
      <v-btn @click="deleteSelected" fab small text :disabled="!selected.length"><v-icon>mdi-delete</v-icon></v-btn>
      <v-btn @click="renameItem" fab small text :disabled="selectedDirectoryItem === rootDirectory"><v-icon>mdi-pencil</v-icon></v-btn>
      <template v-if="selected.length">
        <v-spacer></v-spacer>
        <span class="text-subtitle-2">{{ selected.length }} item{{ selected.length !== 1 ? 's': '' }} selected</span>
      </template>
    </v-sheet>
    <v-card-text style="min-height: 10rem;">
      <v-card flat outlined v-if="rootDirectory.children.length" class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="9">
              <v-treeview
                v-model="selected"
                :items="rootDirectory.children"
                :open.sync="open"
                :active.sync="active"
                :value.sync="selected"
                @update:active="onUpdateActive"
                selection-type="independent"
                selectable
                transition
                activatable
                item-key="key"
                open-on-click
              >
                <template v-slot:prepend="{ item, open }">
                  <v-icon v-if="item.children" @click.stop="onItemClick(item)">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                  <v-icon v-else @click.stop="onItemClick(item)">
                    {{ files[item.name.split('.').pop()] || files['txt'] }}
                  </v-icon>
                </template>
                <template v-slot:label="{ item }">
                  <v-text-field v-if="item.isRenaming" :value="item.name"
                    @change="onRenamed(item, $event)"
                    @keydown.enter="item.isRenaming = false"
                    @click.stop="onItemClick(item)"
                    autofocus>
                  </v-text-field>
                  <div v-else @click.stop="onItemClick(item)">{{ item.name }}</div>
                </template>
              </v-treeview>
            </v-col>
            <v-col cols="3" @click="selectedDirectoryItem = rootDirectory; active = [rootDirectory.key]">
              
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div class="upload-drop-area has-bg-light-gray">
        <b-upload multiple drag-drop expanded v-model="dropFiles">
          <v-alert class="ma-4 has-cursor-pointer has-bg-light-gray" type="info" prominent colored-border icon="mdi-file-multiple">
            <span class="text-subtitle-1">Drop your files here or click to upload</span>
          </v-alert>
        </b-upload>
      </div>
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
  key: string
}

interface IFolder {
  name: string
  children: (IFile | IFolder)[]
  parent: IFolder | null
  isRenaming?: boolean
  key: string
}

@Component({
  name: "cz-folder-structure",
  components: {  },
})
export default class CzFolderStructure extends Vue {
  // @Prop({ default: () => []}) dropFiles!: File[]
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
  // protected selectedDirectoryItem!: IFolder | IFile
  protected rootDirectory: IFolder = { name: 'root', children: [
    
  ], parent: null, key: '' }
  protected open: string[] = []
  protected active: string[] = []
  protected selected: string[] = []
  protected selectedDirectoryItem!: IFolder | IFile
  protected dropFiles: File[] = []

  created() {
    this.selectedDirectoryItem = this.rootDirectory
    // this.directoryItems = this.dropFiles.map((file) => {
    //   return {
    //     name: file.name
    //   } as IDirectoryItem
    // })
  }

  protected onItemClick(item: IFolder | IFile) {
    this.active = [item.key]
  }

  protected renameItem() {
    this.clearRenaming()
    this.selectedDirectoryItem.isRenaming = true
  }

  protected onRenamed(item: IFile | IFolder, name: string) {
    if (name.trim()) {
      item.name = this._getAvailableName(name, item.parent as IFolder, item.name)
    }
    
    item.isRenaming = false
  }

  protected deleteSelected() {
    this.selected.reverse().map((key: string) => {
      const item = this._getItemByKey(key)
      if (item) {
        this._deleteItem(item)
      }
    })
    this.selected = []
  }

  protected onUpdateActive(keys: string[]) {
    const target = this._getItemByKey(keys[0])

    if (this.selectedDirectoryItem !== target && !target?.isRenaming) {
      this.clearRenaming()
    }
    if (keys.length && target) {
      this.selectedDirectoryItem = target
    }
    else {
      this.selectedDirectoryItem = this.rootDirectory
    }
  }

  protected clearRenaming() {
    this._clearRenamingRecursive(this.rootDirectory)
  }

  protected newFolder() {
    this.clearRenaming()
    const newFolder = { name: 'New folder', children: [], parent: null, isRenaming: true, key: Date.now().toString() } as IFolder
    if (this.selectedDirectoryItem.hasOwnProperty('children')) {
      // Selected item is a folder
      newFolder.parent = this.selectedDirectoryItem as IFolder
      newFolder.name = this._getAvailableName(newFolder.name, this.selectedDirectoryItem as IFolder)
      if (this.open.indexOf(newFolder.parent.key) === -1) {
        this.open.push(newFolder.parent.key)
      }
      ;(this.selectedDirectoryItem as IFolder).children.push(newFolder)
    }
    else {
      // Selected item is a file
      newFolder.parent = this.selectedDirectoryItem.parent as IFolder
      newFolder.name = this._getAvailableName(newFolder.name, this.selectedDirectoryItem.parent as IFolder);
      (this.selectedDirectoryItem.parent as IFolder).children = [newFolder, ...this.rootDirectory.children]
    }
  }

  private _deleteItem(item: IFolder | IFile) {
    if  (item === this.rootDirectory) {
      return
    }
    const parent = item.parent as IFolder

    // If it was the active directory, make its parent active
    if (item === this.selectedDirectoryItem) {
      this.selectedDirectoryItem = parent
      this.active = [parent.key]
    }

    const index = parent.children.indexOf(item)
    if (index >= 0) {
      parent.children.splice(index, 1)
    }
  }

  private _getAvailableName(name: string, parent: IFolder, currentName?: string): string {
    let availableName = name
    let nameAlreadyExists = parent.children.some((item: IFile | IFolder) => {
      return item.name === availableName && item.name !== currentName
    })
    let counter = 1

    while(nameAlreadyExists) {
      availableName = `${name} (${counter})`
      nameAlreadyExists = (this.selectedDirectoryItem as IFolder).children.some((item: IFile | IFolder) => {
        return item.name === availableName && item.name !== currentName
      })
      counter++
    }

    return availableName
  }

  private _clearRenamingRecursive(item: IFile | IFolder) {
    item.isRenaming = false
    if (item.hasOwnProperty('children')) {
      (item as IFolder).children.map(this._clearRenamingRecursive)
    }
  }

  private _getItemByKey(key: string): IFolder | IFile | undefined {
    return this._getItemByKeyRecursive(key, this.rootDirectory)
  }

  private _getItemByKeyRecursive(key: string, folder: IFolder): IFolder | IFile | undefined {
    const found = folder.children.find((item) => {
      return item.key === key
    })
    if (found) {
      return found
    }
    else {
      const childFolders = folder.children.filter(item => item.hasOwnProperty('children'))
      for (let i = 0; i < childFolders.length; i++) {
        const found = this._getItemByKeyRecursive(key, childFolders[i] as IFolder)
        if (found) {
          return found
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-drop-area {
  border: 1px dashed #ddd;
  border-radius: 0.5rem;
  cursor: pointer;

  ::v-deep input[type="file"] {
    display: none;
  }
}
</style>
