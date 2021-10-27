export interface ISubmission {
  id: number,
  title: string
  authors: string[]
  repository: EnumRepositoryKeys
  date: Date
  status: EnumSubmissionStatus
  identifier: string
}

export interface IFolder {
  folders?: IFolder[]
  files?: any[]
}

export enum EnumSubmissionStatus {
  draft = 'Draft',
  submitted = 'Submitted'
}

export enum EnumRepositoryKeys {
  hydroShare = 'hydroShare',
  earthChemLibrary = 'earthChemLibrary',
  zenodo = 'zenodo',
  openTopography = 'openTopography',
  sesar = 'sesar',
  other = 'other'
}

export const EnumRepositories = {
  [EnumRepositoryKeys.hydroShare]: 'HydroShare',
  [EnumRepositoryKeys.earthChemLibrary]: 'EarthChem Library',
  [EnumRepositoryKeys.zenodo]: 'Zenodo',
  [EnumRepositoryKeys.openTopography]: 'Open Topography',
  [EnumRepositoryKeys.sesar]: 'System for Earth Sample Registration',
  [EnumRepositoryKeys.other]: 'other'
}

export enum EnumSubmissionSorts {
  title = 'Title',
  date = 'Most Recent',
  repository = 'Repository',
}

export enum EnumSortDirections {
  asc = 'Ascending',
  desc = 'Descending'
}

export interface IRepositoryUrls {
  schemaUrl: string
  uischemaUrl: string
  schemaDefaultsUrl: string
  createUrl: string
  updateUrl: string // To update metadata
  readUrl: string
  fileCreateUrl: string
  fileDeleteUrl: string
  fileReadUrl: string
  accessTokenUrl: string
  authorizeUrl: string
}

export interface IRepository {
  key: string
  name: string
  logoSrc: string
  description: string
  submitLabel?: string
  urls?: IRepositoryUrls
  schema?: any,
  uischema?: any
  schemaDefaults?: any
}