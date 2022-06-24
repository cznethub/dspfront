<template>
  <v-card class="mb-8">
    <v-sheet class="pa-4 d-flex align-center has-bg-light-gray primary lighten-4 files-container--included">
      <v-tooltip v-if="repoMetadata.hasFolderStructure && !isReadOnly" bottom transition="fade">
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

      <template v-if="repoMetadata.hasFolderStructure">
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
      <v-alert v-if="isEditMode && !isReadOnly" class="text-subtitle-1" border="left" colored-border type="info" elevation="1">
        These are your files as they appear in the repository. Any changes you make here will be immediately applied to your files. You do not need to click the Save Changes button for your changes to be effective.
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
                    @click.meta.exact="onItemCtrlClick(item)"
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
                    @click.meta.exact="onItemCtrlClick(item)"
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
                    @click.meta.exact="onItemCtrlClick(item)"
                    @click.shift.exact="onItemShiftClick(item)"
                    :class="{ 'text--secondary': item.isCutting }" class="flex-nowrap ma-0">
                    <v-col class="flex-grow-1 flex-shrink-1" style="overflow: hidden; text-overflow: ellipsis;">{{ item.name }}</v-col>
                    <v-col v-if="item.file" class="flex-grow-0 flex-shrink-0 ma-3 ml-2 pa-0 text-caption text--secondary">{{ item.file.size | prettyBytes(2, false) }}</v-col>
                    <v-col v-else-if="item.uploadedSize" class="flex-grow-0 flex-shrink-0 ma-3 ml-2 pa-0 text-caption text--secondary">{{ item.uploadedSize | prettyBytes(2, false) }}</v-col>
                    <v-col v-if="showFileWarnings(item)"
                      class="flex-grow-0 flex-shrink-0 ma-3 ml-2 pa-0 text-caption text--secondary">
                      <v-menu open-on-hover bottom left offset-y>
                        <template v-slot:activator="{ on, attrs}">
                          <div v-bind="attrs" v-on="on">
                            <v-icon :color="isFileInvalid(item) || couldNotUploadFile(item) ? 'error' : 'warning'">mdi-alert-circle</v-icon>
                          </div>
                        </template>

                        <div class="pa-4 has-bg-white">
                          <div v-if="isFileInvalid(item) || couldNotUploadFile(item)" class="text-body-2 mb-4"><b>This file cannot be uploaded</b></div>
                          <ul class="text-subtitle-1">
                            <li v-if="couldNotUploadFile(item)">Maximum number of files exceeded.</li>
                            <li v-if="!isFileExtensionValid(item)">This file extension is not allowed for upload.</li>
                            <li v-if="!isFileNameValid(item)">This file name contains invalid characters.</li>
                            <li v-if="isFileTooBig(item)">Files cannot be larger than <b>{{ repoMetadata.maxUploadSizePerFile | prettyBytes(2, false) }}</b>.</li>
                          </ul>
                        </div>
                      </v-menu>
                    </v-col>
                    <v-col v-if="canRetryUpload(item)" class="flex-grow-0 flex-shrink-0 ma-3 ml-2 pa-0">
                      <v-btn color="info" @click="$emit('upload', [item])" :disabled="item.isDisabled" small depressed>
                        <v-icon left>mdi-cloud-upload</v-icon>
                        Retry
                      </v-btn>
                    </v-col>
                  </v-row>
                </template>
                <template v-slot:append="{ item, active }">
                  <template v-if="active && !item.isDisabled && canRename">
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

      <v-alert v-if="hasTooManyFiles" class="text-subtitle-1" border="left" colored-border type="error" elevation="1">
        The maximum number of files cannot exceed <b>{{ repoMetadata.maxNumberOfFiles}}</b>
      </v-alert>

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
import { IRepository } from "../submissions/types"

@Component({
  name: "cz-folder-structure",
  components: {  },
  filters: {
  }
})
export default class CzFolderStructure extends mixins<ActiveRepositoryMixin>(ActiveRepositoryMixin) {
  @Prop({ default: false }) repoMetadata!: IRepository
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

  protected get canRename() {
    return !(this.isEditMode && !this.canRenameUploadedFiles) && !this.isReadOnly
  }

  protected get canRenameUploadedFiles() {
    return this.activeRepository.get()?.urls?.moveOrRenameUrl
  }

  protected get allItems(): (IFile | IFolder)[] {
    return this._getDirectoryItems(this.rootDirectory)
  }

  public get hasInvalidFilesToUpload() {
    return this.allItems.some((item: IFile | IFolder) => {
      return !this.isFolder(item)
        && !(item as IFile).isUploaded
        && this.isFileInvalid(item as IFile)
    })
  }

  public get hasTooManyFiles() {
    if (!this.repoMetadata.maxNumberOfFiles) {
      return false
    }

    const validFiles = this.allItems.filter(item => !this.isFileInvalid(item as IFile))
    return validFiles.length > this.repoMetadata.maxNumberOfFiles
  }

  created() {
    console.log(this.allItems)
  }

  // There is a bug in v-treeview when moving items or changing keys. Items become unactivatable
  // We redraw the treeview as a workaround
  public redrawFileTree() {
    this.redraw = this.redraw ? 0 : 1
  }

  @Watch('rootDirectory.children', { deep: true })
  protected onInput() {
    const items = this._getDirectoryItems(this.rootDirectory) as IFile[]
    // Update paths
    items.map(i => i.path = this.getPathString(i.parent as IFolder))
    const updatedItems = this._getDirectoryItems(this.rootDirectory)
    const validItems = updatedItems.filter(item => !this.isFileInvalid(item as IFile))
    this.$emit('input', validItems)
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
        isUploaded: undefined,
      } as IFile

      targetFolder.children.push(newItem)
      return newItem
    })

    this._openRecursive(targetFolder)

    if (this.isEditMode) {
      const validFiles = addedFiles.filter(f => !this.isFileInvalid(f))
      if (validFiles.length && !this.hasTooManyFiles) {
        this.$emit('upload', validFiles)
      }
    }
    this.dropFiles = []
  }

  protected selectAll() {
    this.select(this.allItems)
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
    this.redrawFileTree()
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
    const parent: IFolder = item.parent as IFolder
    const itemIndex = parent.children.indexOf(item)
    const anchorIndex = this.shiftAnchor 
      ? Math.max(0, parent.children.indexOf(this.shiftAnchor))
      : 0

    this.unselectAll()

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

  protected isFileExtensionValid(file: IFile) {
    if (!this.repoMetadata.supportedFileTypes) {
      return true
    }

    const nameWithoutExtension = this._getFileNameWithoutExtension(file.name)
    const extention = file.name.replace(nameWithoutExtension, "")
    return this.repoMetadata.supportedFileTypes.includes(extention)
  }

  protected isFileNameValid(file: IFile) {
    if (!this.repoMetadata.fileNameRegex) {
      return true
    }
    const nameWithoutExtension = this._getFileNameWithoutExtension(file.name)
    const isValid = this.repoMetadata.fileNameRegex.test(nameWithoutExtension)
    return isValid
  }

  protected isFileInvalid(file: IFile) {
    return !this.isFileExtensionValid(file)
      || this.isFileTooBig(file)
  }

  protected hasFileWarnings(file: IFile) {
    return  !this.isFileNameValid(file)
  }

  protected isFileTooBig(file: IFile) {
    if (!this.repoMetadata.maxUploadSizePerFile) {
      return false
    }

    return file.file?.size && file.file?.size > this.repoMetadata.maxUploadSizePerFile
  }

  protected canRetryUpload(item: IFile | IFolder) {
    return this.isEditMode
      && !this.hasTooManyFiles
      && !this.isFolder(item)
      && !this.isFileInvalid(item as IFile)
      && (item as IFile).isUploaded === false
  }

  protected couldNotUploadFile(item: IFile) {
    return this.isEditMode
      && item.isUploaded === false
      && this.hasTooManyFiles
  }

  protected showFileWarnings(item: IFile) {
    return !this.isFolder(item) && (
        this.isFileInvalid(item)
        || this.hasFileWarnings(item)
        || this.couldNotUploadFile(item)
      )
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
    CzNotification.openDialog({
      title: 'Remove files?',
      content: 'Are you sure you want to remove the selected files?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        this._deleteSelected()
      }
    })
  }

  private async _deleteSelected() {
    this.isDeleting = true
    const reversedSelected = this.selected.reverse()

    const response: any[] = []

    // First, disable all items to delete
    for (let i = 0; i < reversedSelected.length; i++) {
      const item = reversedSelected[i]
      this.toggleItemDisabled(item, true)
    }

    for (let i = 0; i < reversedSelected.length; i++) {
      const item = reversedSelected[i]

      if (item) {
        if (item === this.shiftAnchor) {
          this.shiftAnchor = null
        }

        if (this.isEditMode) {
          const isParentSelected = this.isSelected(item.parent as IFolder)
          if (this.isFolder(item) && !(item as IFile).isUploaded) {
            this._deleteItem(item)  // Item hasn't been uploaded, just discard it
          }
          else if (!isParentSelected) {
            const message = await this.deleteFileOrFolder(item)
            response.push(message)
          }
        }
      }
    }

    // TODO: zenodo cannot handle multiple deletes in parallel. We do it sequentially
    if (response.includes(false)) {
      // Failed to delete some file
      CzNotification.toast({
        message: "Some of your files could not be deleted",
        type: 'error'
      })
    }
    this.isDeleting = false
    this.selected = []
  }

  private async deleteFileOrFolder(item: IFile | IFolder): Promise<boolean> {
    let wasDeleted = false
    if (!this.isFolder(item) && this.isFileInvalid(item as IFile)) {
      // File was not uplaoded because it was invalid. No need to delete in repository.
      wasDeleted = true
    }
    else {
      wasDeleted = await this.activeRepository.deleteFileOrFolder(this.identifier, item)
    }
    
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
    this.unselectAll()
  }

  protected include() {
    return [...(document.getElementsByClassName('files-container--included'))]
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
    if (!this.repoMetadata.hasFolderStructure) {
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

  private _getAvailableName(fileName: string, parent: IFolder, currentName?: string): string {
    let availableName = fileName
    let nameAlreadyExists = parent.children.some((item: IFile | IFolder) => {
      return item.name === availableName && item.name !== currentName
    })
    let counter = 1

    while(nameAlreadyExists) {
      const nameWithoutExtension = this._getFileNameWithoutExtension(fileName)
      const extention = fileName.replace(nameWithoutExtension, "")

      availableName = `${nameWithoutExtension} (${counter})${extention}`
      nameAlreadyExists = parent.children.some((item: IFile | IFolder) => {
        return item.name === availableName && item.name !== currentName
      })
      counter++
    }

    return availableName
  }

  private _getFileNameWithoutExtension(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, "")
  }

  private _clearRenamingRecursive(item: IFile | IFolder) {
    item.isRenaming = false
    if (item.hasOwnProperty('children')) {
      (item as IFolder).children.map(this._clearRenamingRecursive)
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

.files-container {
  overflow: auto;
  resize: vertical;
}
</style>
