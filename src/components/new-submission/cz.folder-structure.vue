<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 d-flex align-center has-bg-light-gray primary lighten-4 files-container--included">
      <v-tooltip v-if="allowFolders && !isReadOnly" bottom transition="fade">
        <template v-slot:activator="{ on, attrs}">
          <v-btn @click="newFolder" class="mr-4" small icon v-on="on" v-bind="attrs"><v-icon>mdi-folder</v-icon></v-btn>
        </template>
        New Folder
      </v-tooltip>

      <div v-else class="text-subtitle-1 mr-4">
        Files
      </div>

      <template>
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="selectAll" :disabled="!rootDirectory.children.length" class="mr-1" icon small v-on="on" v-bind="attrs">
              <v-icon>mdi-checkbox-marked-outline</v-icon>
            </v-btn>
          </template>
          <span>Select All</span>
        </v-tooltip>
      </template>

      <template>
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="unselectAll" icon small :disabled="!selected.length" v-on="on" v-bind="attrs">
              <v-icon>mdi-checkbox-blank-off-outline</v-icon>
            </v-btn>
          </template>
          <span>Unselect All</span>
        </v-tooltip>
        <v-divider class="mx-4" vertical></v-divider>
      </template>

      <template v-if="allowFolders">
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs}">
            <v-btn @click="cut" :disabled="!canCut" class="mr-1" icon small v-on="on" v-bind="attrs"><v-icon>mdi-content-cut</v-icon></v-btn>
          </template>
          Cut
        </v-tooltip>

        <v-tooltip v-if="!isReadOnly" bottom transition="fade">
          <template v-slot:activator="{ on, attrs}">
            <v-btn @click="paste" :disabled="!canPaste" icon small v-on="on" v-bind="attrs">
              <v-icon>mdi-content-paste</v-icon>
            </v-btn>
          </template>
          Paste
        </v-tooltip>
        <v-divider class="mx-4" vertical></v-divider>
      </template>

      <template v-if="!isReadOnly">
        <v-tooltip bottom transition="fade">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="deleteSelected" icon small :disabled="isDeleting || !selected.length" v-on="on" v-bind="attrs">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Discard</span>
        </v-tooltip>
      </template>

      <template v-if="selected.length">
        <v-divider class="mx-4" vertical></v-divider>
        <span class="text-subtitle-2">{{ selected.length }} item{{ selected.length !== 1 ? 's': '' }} selected</span>
      </template>

      <v-spacer></v-spacer>

      <template v-if="rootDirectory.children.length && !isEditMode">
        <v-btn @click="empty" small depressed class="primary lighten-2">
          Discard All
        </v-btn>
      </template>
    </v-sheet>

    <v-card-text style="min-height: 10rem;">
      <v-alert v-if="isEditMode && !isReadOnly" class="text-subtitle-1" border="left" colored-border type="info" elevation="2">
        These are your files as they appear in the repository. Any changes you make here will be immediately applied to your files.
      </v-alert>

      <v-card flat outlined v-if="rootDirectory.children.length" class="mb-4">
        <v-card-text class="files-container" style="height: 15rem;">
          <v-row>
            <v-col cols="9" v-click-outside="{ handler: onClickOutside, include }">
              <v-treeview
                item-disabled="isDisabled"
                :items="rootDirectory.children"
                :open.sync="open"
                :active.sync="selected"
                return-object
                multiple-active
                transition
                item-key="key"
                dense
                open-on-click
                class="files-container--included"
                :key="redraw"
              >
                <template v-slot:prepend="{ item, open }">
                  <v-icon v-if="item.children"
                    @click.exact="onItemClick(item)"
                    @click.ctrl.exact="onItemCtrlClick(item)"
                    @click.shift.exact="onItemShiftClick(item)"
                    :disabled="item.isDisabled" :color="item.isCutting ? 'grey': ''">
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                  <v-icon v-else
                    @click.ctrl.exact="onItemCtrlClick(item)"
                    :disabled="item.isDisabled" :color="item.isCutting ? 'grey': ''">
                    {{ files[item.name.split('.').pop()] || files['default'] }}
                  </v-icon>
                </template>
                <template v-slot:label="{ item }">
                  <v-text-field v-if="item.isRenaming"
                    @change="onRenamed(item, $event)"
                    @keydown.enter="item.isRenaming = false"
                    @click.exact="onItemClick(item)"
                    @click.ctrl.exact="onItemCtrlClick(item)"
                    @click.shift.exact="onItemShiftClick(item)"
                    @click:append="item.isRenaming = false"
                    :value="item.name"
                    v-click-outside="onClickOutside"
                    append-icon="mdi-cancel"
                    dense
                    hide-details="auto"
                    autofocus>
                  </v-text-field>
                  <v-row v-else
                    @click.exact="onItemClick(item)"
                    @click.ctrl.exact="onItemCtrlClick(item)"
                    @click.shift.exact="onItemShiftClick(item)"
                    :class="{ 'text--secondary': item.isCutting }" class="flex-nowrap ma-0">
                    <v-col class="flex-grow-1 flex-shrink-1" style="overflow: hidden; text-overflow: ellipsis;">{{ item.name }}</v-col>
                    <v-col v-if="item.file" class="flex-grow-0 flex-shrink-0 ma-3 ml-2 pa-0 text-caption text--secondary">{{ item.file.size | prettyBytes }}</v-col>
                  </v-row>
                </template>
                <template v-slot:append="{ item, active }">
                  <template v-if="active && !item.isDisabled && !isReadOnly">
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
      <div v-else-if="isReadOnly" class="pa-2 text-body-1 text--secondary">
        No files have been included in this submission
      </div>

      <div v-if="!isReadOnly" class="upload-drop-area files-container--included">
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
  @Prop({ default: false }) isReadOnly!: boolean
  @Prop() identifier!: string  // Use if isEditMode is true
  @Prop({ required: true }) rootDirectory!: IFolder
  protected redraw = 0

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
  protected open: (IFolder | IFile)[] = []
  protected selected: (IFolder | IFile)[] = []
  protected dropFiles: File[] = []
  protected isDeleting = false
  protected fileReleaseDate = null
  protected shiftAnchor: IFolder | IFile | null = null

  protected get itemsToCut(): (IFile | IFolder)[] {
    return this._itemsToCutRecursive(this.rootDirectory)
  }

  protected get activeDirectoryItem(): IFolder | IFile {
    if (this.selected.length !== 1) {
      return this.rootDirectory
    }
    else {
      return this.selected[0]
    }
  }

  protected get canPaste() {
    const isValidTarget = this.selected.length <= 1
    const areItemsValid = this.itemsToCut.length && !this.itemsToCut.includes(this.activeDirectoryItem)
    return isValidTarget && areItemsValid
  }

  protected get canCut() {
    return this.selected.length && !this.isReadOnly
  }

  created() {
    // this.activeDirectoryItem = this.rootDirectory
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
    const targetFolder: IFolder = this.activeDirectoryItem.hasOwnProperty('children')
      ? this.activeDirectoryItem as IFolder
      : this.activeDirectoryItem.parent as IFolder

    const addedFiles = newFiles.map((file, index) => {
      const newItem = {
        name: this._getAvailableName(file.name, targetFolder),
        parent: targetFolder,
        path: this.getPathString(targetFolder),
        key: `${Date.now().toString()}-${index}`,
        file: file,
        // Need to populate these optional properties so that Vue can set reactive bindings to it
        isRenaming: false,
        isCutting: false,
        isDisabled: false,
      } as IFile

      targetFolder.children.push(newItem)
      return newItem
    })

    this._openRecursive(targetFolder)

    if (this.isEditMode) {
      this.$emit('upload', addedFiles)
    }
    this.dropFiles = []
  }

  protected selectAll() {
    const allItems = this._getDirectoryItems(this.rootDirectory)
    this.select(allItems)
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
    return this.selected.includes(item)
  }

  protected select(items: (IFolder | IFile)[]) {
    this.selected = [...new Set([...this.selected, ...items])]
  }

  protected unselect(item: IFolder | IFile) {
    const index = this.selected.indexOf(item)
    if (index >= 0) {
      this.selected.splice(index, 1)
    }
  }

  protected unselectAll() {
    this.selected = []
  }

  protected cut() {
    this.uncutAll()

    this.selected.map((item) => {
      if (item) {
        item.isCutting = true
      }
    })
  }

  protected uncutAll() {
    this.itemsToCut.map((item) => {
      item.isCutting = false
    })
  }

  protected async paste() {
    const pastePromises: Promise<boolean>[] = []
    const itemsToCut = [ ...this.itemsToCut ] // We make a copy because the original can change during iteration below

    for (let i = 0; i < itemsToCut.length; i++) {
      const item = itemsToCut[i]
      const targetFolder: IFolder = this.isFolder(this.activeDirectoryItem)
        ? this.activeDirectoryItem as IFolder
        : this.activeDirectoryItem.parent as IFolder

      if (item && item.parent !== targetFolder) {
        if (this.isEditMode) {
          pastePromises.push(this._paste(item, targetFolder))
        }
        else {
          this.moveItem(item, targetFolder)
        }
      }
    }

    await Promise.all(pastePromises)

    this.itemsToCut.map((item) => {
      item.isCutting = false
    })
    this.unselectAll()
     // There is a bug in v-treeview when moving items. Moved items become unactivatable
     // We redraw the treeview as a workaround
    this.redraw = this.redraw ? 0 : 1
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
    this.unselectAll()
    this.select([item])
    this.shiftAnchor = item
  }

  protected onItemCtrlClick(item: IFolder | IFile) {
    this.toggleSelect(item)
    this.shiftAnchor = item
  }

  protected onItemShiftClick(item: IFolder | IFile) {
    if (!this.shiftAnchor || item.parent !== this.shiftAnchor.parent) {
      this.shiftAnchor = item
    }

    this.unselectAll()

    const parent: IFolder = this.shiftAnchor.parent as IFolder

    const itemIndex = parent.children.indexOf(item)
    const anchorIndex = parent.children.indexOf(this.shiftAnchor)

    const first = Math.min(itemIndex, anchorIndex)
    const last = Math.max(itemIndex, anchorIndex)

    const itemsToSelect: (IFolder | IFile)[] = []

    for (let i = first; i <= last; i++) {
      itemsToSelect.push(parent.children[i])
    }
    this.select(itemsToSelect)
  }

  protected toggleSelect(item: IFolder | IFile) {
    if (this.isSelected(item)) {
      this.unselect(item)
    }
    else {
      this.select([item])
    }
  }

  protected renameItem(item: IFile | IFolder) {
    this.clearRenaming()
    item.isRenaming = true
  }

  protected async onRenamed(item: IFile | IFolder, name: string) {
    if (name.trim()) {
      const newName = this._getAvailableName(name, item.parent as IFolder, item.name)

      if (this.isEditMode) {
        item.isDisabled = true
        const newPath = item.path ? item.path + '/' + newName : newName
        const wasRenamed = await this.activeRepository.renameFileOrFolder(this.identifier, item, newPath)
        if (wasRenamed) {
          item.name = newName
        }
        item.isDisabled = false
      }
      else {
        item.name = newName
      }
    }
    
    item.isRenaming = false
  }

  protected async deleteSelected() {
    this.isDeleting = true
    const reversedSelected = this.selected.reverse()
    const deletePromises: Promise<boolean>[] = []

    for (let i = 0; i < reversedSelected.length; i++) {
      const item = reversedSelected[i]

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
      // Failed to delete some file
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
    // this.activeDirectoryItem = this.rootDirectory
    this.unselectAll()
    // this.active = [this.rootDirectory.key]
  }

  // protected onSetActiveRootDirectory() {
  //   this.activeDirectoryItem = this.rootDirectory
  //   this.unselectAll()
  //   // this.active = []
  // }

  protected include() {
    return [...(document.getElementsByClassName('files-container--included'))]
  }

  // protected onUpdateActive(keys: string[]) {
  //   const target = this._getItemByKey(keys[0])

  //   if (this.activeDirectoryItem !== target && !target?.isRenaming) {
  //     this.clearRenaming()
  //   }
  //   if (keys.length && target) {
  //     this.activeDirectoryItem = target
  //   }
  //   else {
  //     this.activeDirectoryItem = this.rootDirectory
  //   }
  // }

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
        this.selected = []
        this.open = []
      }
    })
  }

  protected updateFolderPath(folder: IFolder) {
    folder.path = folder.parent === this.rootDirectory
      ? ''
      : folder.parent?.path 
        ? folder.parent.path + '/' + folder.parent.name 
        : folder.parent?.name
      || ''
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

    this.updateFolderPath(newFolder)

    if (this.isEditMode) {
      this.$emit('upload', [newFolder])
    }

    newFolder.parent.children.push(newFolder)
    newFolder.parent.children = newFolder.parent.children.sort((a, b) => {
      return b.hasOwnProperty('children') ? 1 : -1
    })

    this._openRecursive(newFolder)
  }

  private _openRecursive(item: IFile | IFolder) {
    if (this.isFolder(item)) {
      this.open = [...new Set([...this.open, item])]
    }
    if (item.parent) {
      this.open = [...new Set([...this.open, item.parent])]
      this._openRecursive(item.parent)
    }
  }

  private _deleteItem(item: IFolder | IFile) {
    if  (item === this.rootDirectory) {
      return
    }
    const parent = item.parent as IFolder

    // If it was the active directory, make its parent active
    // if (item === this.activeDirectoryItem) {
      // this.activeDirectoryItem = parent
      // this.active = [parent.key]
    // }

    const index = parent.children.indexOf(item)
    if (index >= 0) {
      parent.children.splice(index, 1)
      // If the folder is now empty, mark it as closed
      if (!parent.children.length) {
        const index = this.open.indexOf(parent)
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

  // private _getItemByKey(key: string): IFolder | IFile | undefined {
  //   return this._getItemByKeyRecursive(key, this.rootDirectory)
  // }

  // private _getItemByKeyRecursive(key: string, folder: IFolder): IFolder | IFile | undefined {
  //   const found = folder.children.find((item) => {
  //     return item.key === key
  //   })
  //   if (found) {
  //     return found
  //   }
  //   else {
  //     const childFolders = folder.children.filter(item => item.hasOwnProperty('children'))
  //     for (let i = 0; i < childFolders.length; i++) {
  //       const found = this._getItemByKeyRecursive(key, childFolders[i] as IFolder)
  //       if (found) {
  //         return found
  //       }
  //     }
  //   }
  // }

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

  // private _hasSomeChildUnselected(item: IFolder) {
  //   return item.children.some((c) => {
  //     return !this.isSelected(c)
  //   })
  // }

  private _itemsToCutRecursive(item: IFolder): (IFile | IFolder)[] {
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

  private async _paste(item, targetFolder) {
    let newPath = this.getPathString(targetFolder)
    newPath = newPath ? newPath + '/' + item.name : item.name
    item.isDisabled = true
    const wasMoved = await this.activeRepository.renameFileOrFolder(this.identifier, item, newPath)
    if (wasMoved) {
      this.moveItem(item, targetFolder)
    }
    item.isDisabled = false
    return wasMoved
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

// ::v-deep  .v-treeview-node--selected > .v-treeview-node__root {
//   // background: rgb(25, 118, 210);
//   color: #1976d2 !important;
//   // caret-color: #1976d2 !important;

//   &::before {
//     opacity: 0.12
//   }
// }

.files-container {
  overflow: auto;
  resize: vertical;
}

</style>
