export interface IFile {
  name: string
  serverName?: string
  parent: IFolder | null
  isRenaming?: boolean
  isCutting?: boolean
  isDisabled?: boolean
  key: string
  path: string
  file: File | null
}

export interface IFolder {
  name: string
  parent: IFolder | null
  isRenaming?: boolean
  isCutting?: boolean
  isDisabled?: boolean
  key: string
  path: string
  children: (IFile | IFolder)[]
}