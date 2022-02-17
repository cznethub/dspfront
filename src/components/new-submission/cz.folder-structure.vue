<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 d-flex align-center has-bg-light-gray primary lighten-4">
      <v-tooltip v-if="allowFolders" bottom transition="fade">
        <template v-slot:activator="{ on, attrs}">
          <v-btn @click="newFolder" class="mr-4" small icon v-on="on" v-bind="attrs"><v-icon>mdi-folder</v-icon></v-btn>
        </template>
        New Folder
      </v-tooltip>
      <div v-else class="text-subtitle-1 mr-4">
        Files
      </div>

      <template v-if="rootDirectory.children.length">
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="selectAll" class="mr-1" icon small v-on="on" v-bind="attrs">
              <v-icon>mdi-checkbox-marked-outline</v-icon>
            </v-btn>
          </template>
          <span>Select All</span>
        </v-tooltip>
      </template>

      <template v-if="selected.length">
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="selected = []" icon small :disabled="!selected.length" v-on="on" v-bind="attrs">
              <v-icon>mdi-checkbox-blank-off-outline</v-icon>
            </v-btn>
          </template>
          <span>Unselect All</span>
        </v-tooltip>
        <v-divider class="mx-4" vertical></v-divider>
      </template>

      <template v-if="allowFolders && (selected.length || itemsToCut.length)">
        <v-tooltip v-if="selected.length" bottom transition="fade">
          <template v-slot:activator="{ on, attrs}">
            <v-btn @click="cut" class="mr-1" icon small v-on="on" v-bind="attrs"><v-icon>mdi-content-cut</v-icon></v-btn>
          </template>
          Cut
        </v-tooltip>

        <v-tooltip v-if="(itemsToCut.length || selected.length)" bottom transition="fade">
          <template v-slot:activator="{ on, attrs}">
            <v-btn @click="paste" icon small v-on="on" v-bind="attrs" :disabled="!itemsToCut.length || itemsToCut.includes(activeDirectoryItem)">
              <v-icon>mdi-content-paste</v-icon>
            </v-btn>
          </template>
          Paste
        </v-tooltip>
        <v-divider v-if="selected.length" class="mx-4" vertical></v-divider>
      </template>

      <template v-if="selected.length">
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="deleteSelected" icon small :disabled="isDeleting" v-on="on" v-bind="attrs">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Discard</span>
        </v-tooltip>
        <v-divider class="mx-4" vertical></v-divider>
        <span class="text-subtitle-2">{{ selected.length }} item{{ selected.length !== 1 ? 's': '' }} selected</span>
      </template>

      <v-spacer></v-spacer>

      <template v-if="rootDirectory.children.length">
        <v-btn @click="empty" small depressed class="primary lighten-2">
          Discard All
        </v-btn>
      </template>
      
    </v-sheet>
    <v-card-text style="min-height: 10rem;">
      <v-alert v-if="isEditMode" class="text-subtitle-1" border="left" colored-border type="info" elevation="2">
        These are your files as they appear in HydroShare. Any changes you make here will be immediately applied to your files.
      </v-alert>
      <v-card flat outlined v-if="rootDirectory.children.length" class="mb-4">
        <v-card-text class="files-container" style="height: 15rem;">
          <v-row>
            <v-col cols="9" v-click-outside="{ handler: onSetActiveRootDirectory, include: include}">
              <v-treeview
                v-model="selected"
                @update:active="onUpdateActive"
                item-disabled="isDisabled"
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
                  <v-icon v-if="item.children" @click.stop="onItemClick(item)" :color="item.isCutting ? 'grey': ''">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                  <v-icon v-else @click.stop="onItemClick(item)" :color="item.isCutting ? 'grey': ''">
                    {{ files[item.name.split('.').pop()] || files['default'] }}
                  </v-icon>
                </template>
                <template v-slot:label="{ item }">
                  <v-text-field v-if="item.isRenaming"
                    @change="onRenamed(item, $event)"
                    @keydown.enter="item.isRenaming = false"
                    @click.stop="onItemClick(item)"
                    @click:append="item.isRenaming = false"
                    :value="item.name"
                    v-click-outside="onClickOutside"
                    append-icon="mdi-cancel"
                    dense
                    hide-details
                    autofocus>
                  </v-text-field>
                  <v-row v-else @click.stop="onItemClick(item)" :class="{ 'text--secondary': item.isCutting }" class="flex-nowrap">
                    <v-col class="flex-grow-1 flex-shrink-1" style="overflow: hidden; text-overflow: ellipsis;">{{ item.name }}</v-col>
                    <v-col v-if="item.file" class="flex-grow-0 flex-shrink-0 ml-2 text-caption text--secondary">{{ item.file.size | prettyBytes }}</v-col>
                  </v-row>
                </template>
                <template v-slot:append="{ item, active }">
                  <template v-if="active && !item.isDisabled">
                    <v-btn v-if="!item.isRenaming"
                      @click.stop="renameItem(item)" fab small text><v-icon>mdi-pencil-outline</v-icon></v-btn>
                  </template>
                  <v-icon v-if="item.isDisabled" small>fas fa-circle-notch fa-spin</v-icon>
                </template>
              </v-treeview>
            </v-col>
            <v-col cols="3"></v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div class="upload-drop-area files-container--included">
        <b-upload type="file" multiple drag-drop expanded v-model="dropFiles" class="has-bg-light-gray">
          <v-alert class="ma-4 has-cursor-pointer transparent" type="info" prominent colored-border icon="mdi-paperclip">
            <span class="text-subtitle-1">Drop your files here or click to upload</span>
          </v-alert>
        </b-upload>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import CzNotification from "@/models/notifications.model"
import { Component, Watch, Prop } from "vue-property-decorator"
import { IFolder, IFile } from '@/components/new-submission/types'
import { mixins } from 'vue-class-component'
import { ActiveRepositoryMixin } from '@/mixins/activeRepository.mixin'

@Component({
  name: "cz-folder-structure",
  components: {  },
  filters: {
  }
})
export default class CzFolderStructure extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  @Prop({ default: false }) allowFolders!: boolean
  @Prop({ default: false }) isEditMode!: boolean
  @Prop() identifier!: string  // Use if isEditMode is true
  @Prop({ required: true }) rootDirectory!: IFolder

  protected files = {
    html: 'mdi-language-html5',
    md: 'mdi-language-markdown',
    js: 'mdi-nodejs',
    json: 'mdi-code-json',
    pdf: 'mdi-file-pdf-box',
    txt: 'mdi-file-document-outline',

    zip: 'mdi-folder-zip',
    rar: 'mdi-folder-zip',

    exe: 'mdi-application-outline',

    png: 'mdi-file-image-outline',
    jpg: 'mdi-file-image-outline',

    mp4: 'mdi-file-video-outline',

    mp3: 'mdi-file-music-outline',
    wav: 'mdi-file-music-outline',

    xlsm: 'mdi-file-excel-outline',
    xlsb: 'mdi-file-excel-outline',
    xlsx: 'mdi-file-excel-outline',
    xltx: 'mdi-file-excel-outline',
    xltm: 'mdi-file-excel-outline',
    xlt: 'mdi-file-excel-outline',
    xls: 'mdi-file-excel-outline',
    xla: 'mdi-file-excel-outline',

    ppt: 'mdi-file-powerpoint-outline',
    pptx: 'mdi-file-powerpoint-outline',

    card: 'mdi-file-cad',
    default: 'mdi-file-outline',
  }
  protected open: string[] = []
  protected active: string[] = []
  protected selected: string[] = []
  protected activeDirectoryItem!: IFolder | IFile
  protected dropFiles: File[] = []
  protected isDeleting = false

  protected get itemsToCut() {
    return this._itemsToCutRecursive(this.rootDirectory)
  }

  created() {
    this.activeDirectoryItem = this.rootDirectory
  }

  @Watch('rootDirectory.children', { deep: true })
  protected onInput() {
    const items = this._getDirectoryItems(this.rootDirectory) as IFile[]
    // Update paths
    items.map(i => i.path = this.getPathString(i.parent as IFolder))
    this.$emit('input', this._getDirectoryItems(this.rootDirectory))
  }

  @Watch('dropFiles')
  protected onFilesDropped(newFiles: File[]) {
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
        path: '',
        key: `${Date.now().toString()}-${index}`,
        file,
        // Need to populate these optional properties so that Vue can set reactive bindings to it
        isRenaming: false,
        isCutting: false,
        isDisabled: false,
      } as IFile)
    })
    this._openRecursive(targetFolder)
    this.dropFiles = []
  }

  @Watch('selected')
  protected onSelectedChanged(newSelected: string[], oldSelected: string[]) {
    const isSelecting = newSelected.length > oldSelected.length
    const selectedItems = newSelected.map((key: string) => this._getItemByKey(key))

    if (isSelecting) {
      // When a folder is selected, select all its child items as well
      selectedItems.map((item: IFolder | IFile | undefined) => {
        if (item && this.isFolder(item)) {
          if (this._hasSomeChildUnselected(item as IFolder)) {
            this.select((item as IFolder).children.map(i => i.key))
          }
        }
      })
    }
    else {
      // If a selected item is a folder and has some child unselected, unselect it
      selectedItems.map((item: IFolder | IFile | undefined) => {
        if (item && this.isFolder(item) && this._hasSomeChildUnselected(item as IFolder)) {
          this.unselect(item.key)
        }
      })
    }
  }

  protected selectAll() {
    this.select(this.rootDirectory.children.map(item => item.key))
  }

  protected getPathString(item: IFolder | IFile) {
    if (item === this.rootDirectory) {
      return ''
    }
    const pre = this.getPathString(item.parent as IFolder)
    return `${pre ? pre + '/': ''}${item.name}`
  }

  protected isFolder(item: IFile | IFolder) {
    return item.hasOwnProperty('children')
  }

  protected isSelected(item: IFolder | IFile) {
    return this.selected.includes(item.key)
  }

  protected select(keys: string[]) {
    this.selected = [...new Set([...this.selected, ...keys])]
  }

  protected unselect(key: string) {
    const index = this.selected.indexOf(key)
    if (index >= 0) {
      this.selected.splice(index, 1)
    }
  }

  protected cut() {
    this.selected.map((key) => {
      const item = this._getItemByKey(key)
      if (item) {
        item.isCutting = true
      }
    })
  }

  protected paste() {
    this.itemsToCut.map((item) => {
      const targetFolder: IFolder = this.isFolder(this.activeDirectoryItem)
        ? this.activeDirectoryItem as IFolder
        : this.activeDirectoryItem.parent as IFolder
      if (item && !this.isSelected(item.parent as IFolder)) {
        this.moveItem(item, targetFolder)
      }
    })

    // Uncomment if we want to unselect items after moving them
    // this.itemsToCut.map((item) => {
    //   this.unselect(item.key)
    // })

    this.itemsToCut.map((item) => {
      item.isCutting = false
    })
  }

  protected moveItem(item: IFolder | IFile, destination: IFolder) {
    const previousParent = item.parent as IFolder

    // Remove from previous parent
    const index = previousParent.children.indexOf(item)
    if (index >= 0) {
      previousParent.children.splice(index, 1)
    }

    // Add to destination
    item.parent = destination
    item.name = this._getAvailableName(item.name, item.parent)
    destination.children.push(item)
    destination.children = destination.children.sort((a, b) => {
      return b.hasOwnProperty('children') ? 1 : -1
    })
    this._openRecursive(destination)
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

  protected async deleteSelected() {
    this.isDeleting = true
    const reversedSelected = this.selected.reverse()
    const deletePromises: Promise<boolean>[] = []

    for (let i = 0; i < reversedSelected.length; i++) {
      const key = reversedSelected[i]
      const item = this._getItemByKey(key)

      if (item) {
        if (this.isEditMode) {
          const isParentSelected = this.isSelected(item.parent as IFolder)
          if (!isParentSelected) {
            const p = this.deleteFileOrFolder(item)
            deletePromises.push(p)
          }
        }
        else {
          this._deleteItem(item)
        }
      }
    }

    const wereDeleted = await Promise.all(deletePromises)
    if (wereDeleted) {
      console.log(wereDeleted)
      // Failed to delete
    }
    this.isDeleting = false
    this.selected = []
  }

  private async deleteFileOrFolder(item: IFile | IFolder) {
    this.toggleItemDisabled(item, true)
    const wasDeleted = await this.activeRepository.deleteFileOrFolder(this.identifier, item)
    this.toggleItemDisabled(item, false)
    if (wasDeleted) {
      this._deleteItem(item)
    }
    return wasDeleted
  }

  private toggleItemDisabled(item: IFolder | IFile, isDisabled: boolean) {
    item.isDisabled = isDisabled
    if (this.isFolder(item)) {
      (item as IFolder).children.map((item) => {
        (item as IFolder).isDisabled = isDisabled
        this.toggleItemDisabled(item as IFolder, isDisabled)
      })
    }
  }

  protected onClickOutside() {
    this.activeDirectoryItem = this.rootDirectory
    this.active = [this.rootDirectory.key]
  }

  protected onSetActiveRootDirectory() {
    this.activeDirectoryItem = this.rootDirectory
    this.active = []
  }

  protected include() {
    return [document.querySelector('.files-container--included')]
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
    if (!this.allowFolders) {
      return
    }

    this.clearRenaming()
    const newFolder = { 
      name: 'New folder', 
      children: [], 
      parent: null, 
      isRenaming: false,
      isCutting: false,
      isDisabled: false,
      key: Date.now().toString(),
      path: '',
    } as IFolder
    if (this.activeDirectoryItem.hasOwnProperty('children')) {
      // Selected item is a folder
      newFolder.parent = this.activeDirectoryItem as IFolder
      newFolder.name = this._getAvailableName(newFolder.name, this.activeDirectoryItem as IFolder)
    }
    else {
      // Selected item is a file
      newFolder.parent = this.activeDirectoryItem.parent as IFolder
      newFolder.name = this._getAvailableName(newFolder.name, newFolder.parent as IFolder)
    }
    newFolder.parent.children.push(newFolder)
    newFolder.parent.children = newFolder.parent.children.sort((a, b) => {
      return b.hasOwnProperty('children') ? 1 : -1
    })
    this._openRecursive(newFolder)
  }

  private _openRecursive(item: IFile | IFolder) {
    if (this.isFolder(item)) {
      this.open = [...new Set([...this.open, item.key])]
    }
    if (item.parent) {
      this.open = [...new Set([...this.open, item.parent.key])]
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
      nameAlreadyExists = parent.children.some((item: IFile | IFolder) => {
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

  /** Returns all files inside the given folder */
  private _getDirectoryItems(item: IFolder): (IFile | IFolder)[] {
    const childFolders = item.children.filter(i => this.isFolder(i)) as IFolder[]

    let nestedItems: (IFile | IFolder)[] = []
    for (let i = 0; i < childFolders.length; i++) {
      const newItems = this._getDirectoryItems(childFolders[i])
      nestedItems.push(...newItems)
    }

    return [...item.children, ...nestedItems]
  }

  // private _hasSomeChildSelected(item: IFolder) {
  //   return item.children.some((c) => {
  //     return this.isSelected(c)
  //   })
  // }

  private _hasSomeChildUnselected(item: IFolder) {
    return item.children.some((c) => {
      return !this.isSelected(c)
    })
  }

  private _itemsToCutRecursive(item: IFolder) {
    const childFolders = item.children.filter(i => this.isFolder(i)) as IFolder[]

    return [
      ...item.children.filter(f => f.isCutting),
      ...childFolders
        .filter(f => f.children.length)
        .map(f => this._itemsToCutRecursive(f))
        .reduce((acc, curr) => {
          return [...acc, ...curr]
        }, [])
    ] 
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

  ::v-deep .upload-draggable.is-hovered {
    background: lightgray;
  }
}

.files-container {
  overflow: auto;
  resize: vertical;
}

</style>
