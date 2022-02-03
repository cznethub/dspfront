<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 d-flex align-center has-bg-light-gray">
      <v-btn @click="newFolder" fab small text><v-icon>mdi-folder</v-icon></v-btn>
      <v-divider class="mx-4" vertical></v-divider>
      <v-btn @click="empty" :disabled="!rootDirectory.children.length" small depressed>
        <v-icon>mdi-delete-empty</v-icon>
        Empty
      </v-btn>
      <template v-if="selected.length">
        <v-spacer></v-spacer>
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="selected = []" fab small text :disabled="!selected.length" v-on="on" v-bind="attrs">
              <v-icon>mdi-checkbox-blank-off</v-icon>
            </v-btn>
          </template>
          <span>Unselect All</span>
        </v-tooltip>
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="deleteSelected" fab small text :disabled="!selected.length" v-on="on" v-bind="attrs">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>
        
        <v-divider class="mx-4" vertical></v-divider>
        <span class="text-subtitle-2">{{ selected.length }} item{{ selected.length !== 1 ? 's': '' }} selected</span>
      </template>
    </v-sheet>
    <v-card-text style="min-height: 10rem;">

      <v-card flat outlined v-if="rootDirectory.children.length" class="mb-4">
        <v-card-text class="files-container" style="height: 15rem;">
          <v-row>
            <v-col cols="9" v-click-outside="{ handler: onSetActiveRootDirectory, include: include}">
              <v-treeview
                v-model="selected"
                @update:active="onUpdateActive"
                :items="rootDirectory.children"
                :open.sync="open"
                :active.sync="active"
                :value.sync="selected"
                selection-type="independent"
                selectable
                transition
                activatable
                item-key="key"
                dense
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
                  <v-text-field v-if="item.isRenaming"
                    @change="onRenamed(item, $event)"
                    @keydown.enter="item.isRenaming = false"
                    @click.stop="onItemClick(item)"
                    @click:append="item.isRenaming = false"
                    v-click-outside="onClickOutside"
                    :value="item.name"
                    append-icon="mdi-cancel"
                    dense
                    hide-details
                    autofocus>
                  </v-text-field>
                  <div v-else @click.stop="onItemClick(item)">{{ item.name }}</div>
                </template>
                <template v-slot:append="{ item, active }">
                  <template v-if="active">
                    <v-btn v-if="!item.isRenaming"
                      @click.stop="renameItem(item)" fab small text><v-icon>mdi-pencil</v-icon></v-btn>
                  </template>
                </template>
              </v-treeview>
            </v-col>
            <v-col cols="3"></v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div class="upload-drop-area has-bg-light-gray included">
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
import { Component, Vue, Watch } from "vue-property-decorator"

interface IFile {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  key: string
  file: File
}

interface IFolder {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  key: string
  children: (IFile | IFolder)[]
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
  // protected activeDirectoryItem!: IFolder | IFile
  protected rootDirectory: IFolder = { name: 'root', children: [
    
  ], parent: null, key: '' }
  protected open: string[] = []
  protected active: string[] = []
  protected selected: string[] = []
  protected activeDirectoryItem!: IFolder | IFile
  protected dropFiles: File[] = []

  created() {
    this.activeDirectoryItem = this.rootDirectory
    // this.directoryItems = this.dropFiles.map((file) => {
    //   return {
    //     name: file.name
    //   } as IDirectoryItem
    // })
  }

  @Watch('dropFiles')
  onFilesDropped(newFiles: File[]) {
    if (!newFiles.length) {
      return
    }
    const targetFolder = this.activeDirectoryItem.hasOwnProperty('children')
      ? this.activeDirectoryItem as IFolder
      : this.activeDirectoryItem.parent as IFolder

    newFiles.map((file, index) => {
      targetFolder.children.push({
        name: this._getAvailableName(file.name, targetFolder),
        parent: targetFolder,
        key: `${Date.now().toString()}-${index}`,
        isRenaming: false,  // Need to pass it so that Vue can set reactive bindings to it
        file
      } as IFile)
    })
    this._openRecursive(targetFolder)
    this.dropFiles = []
  }

  @Watch('selected')
  onSelectedChanged(newSelected: string[]) {
    // When a folder is selected, select all its child items as well
    const items = newSelected.map((key: string) => this._getItemByKey(key))
    items.map((item: IFolder | IFile | undefined) => {

      if (item && item.hasOwnProperty('children')) {
        const children = (item as IFolder).children
        if (children.some(c => this.selected.indexOf(c.key) === -1)) {
          this.select(children.map(i => i.key))
        }
      }
    })
  }

  protected select(keys: string[]) {
    this.selected = [...new Set([...this.selected, ...keys])]
  }

  protected onItemClick(item: IFolder | IFile) {
    this.active = [item.key]
  }

  protected renameItem(item: IFile | IFolder) {
    this.clearRenaming()
    item.isRenaming = true
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

  protected onClickOutside() {
    this.activeDirectoryItem = this.rootDirectory
    this.active = [this.rootDirectory.key]
  }

  protected onSetActiveRootDirectory() {
    this.activeDirectoryItem = this.rootDirectory
    this.active = []
  }

  protected include () {
    return [document.querySelector('.included')]
  }

  protected onUpdateActive(keys: string[]) {
    const target = this._getItemByKey(keys[0])

    if (this.activeDirectoryItem !== target && !target?.isRenaming) {
      this.clearRenaming()
    }
    if (keys.length && target) {
      this.activeDirectoryItem = target
    }
    else {
      this.activeDirectoryItem = this.rootDirectory
    }
  }

  protected clearRenaming() {
    this._clearRenamingRecursive(this.rootDirectory)
  }

  protected empty() {
    CzNotification.openDialog({
      title: 'Remove all files?',
      content: 'Are you sure you want to remove all files from this list?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        this.rootDirectory.children = []
        this.activeDirectoryItem = this.rootDirectory
        this.selected = []
        this.open = []
        this.active = []
      }
    })
  }

  protected newFolder() {
    this.clearRenaming()
    const newFolder = { name: 'New folder', children: [], parent: null, isRenaming: true, key: Date.now().toString() } as IFolder
    if (this.activeDirectoryItem.hasOwnProperty('children')) {
      // Selected item is a folder
      newFolder.parent = this.activeDirectoryItem as IFolder
      newFolder.name = this._getAvailableName(newFolder.name, this.activeDirectoryItem as IFolder)
      newFolder.parent.children.push(newFolder)
      newFolder.parent.children = newFolder.parent.children.sort((a, b) => {
        return a.hasOwnProperty('children') ? -1 : 1
      })
    }
    else {
      // Selected item is a file
      newFolder.parent = this.activeDirectoryItem.parent as IFolder
      newFolder.name = this._getAvailableName(newFolder.name, newFolder.parent as IFolder);
      newFolder.parent.children = [newFolder, ...this.rootDirectory.children]
    }
    this._openRecursive(newFolder)
  }

  private _openRecursive(item: IFile | IFolder) {
    if (item.hasOwnProperty('children')) {
      if (this.open.indexOf(item.key) === -1) {
        this.open.push(item.key)
      }
    }
    if (item.parent) {
      if (this.open.indexOf(item.parent.key) === -1) {
        this.open.push(item.parent.key)
      }
      this._openRecursive(item.parent)
    }
  }

  private _deleteItem(item: IFolder | IFile) {
    if  (item === this.rootDirectory) {
      return
    }
    const parent = item.parent as IFolder

    // If it was the active directory, make its parent active
    if (item === this.activeDirectoryItem) {
      this.activeDirectoryItem = parent
      this.active = [parent.key]
    }

    const index = parent.children.indexOf(item)
    if (index >= 0) {
      parent.children.splice(index, 1)
      // If the folder is now empty, mark it as closed
      if (!parent.children.length) {
        const index = this.open.indexOf(parent.key)
        if (index >= 0) {
          this.open.splice(index, 1)
        }
      }
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
      nameAlreadyExists = (this.activeDirectoryItem as IFolder).children.some((item: IFile | IFolder) => {
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

.files-container {
  overflow: auto;
  resize: vertical;
}
</style>
