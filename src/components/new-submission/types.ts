export interface IFile {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  isCutting?: boolean
  key: string
  path: string
  file: File
}

export interface IFolder {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  isCutting?: boolean
  key: string
  path: string
  children: (IFile | IFolder)[]
}