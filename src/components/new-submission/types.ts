export interface IFile {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  isCutting?: boolean
  key: string
  file: File
  path: string
}

export interface IFolder {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  isCutting?: boolean
  key: string
  children: (IFile | IFolder)[]
}