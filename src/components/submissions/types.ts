export interface ISubmission {
  title: string
  authors: string[]
  repository: EnumRepositoryKeys
  date: number
  identifier: string
  url: string
  metadata: any
}

export enum EnumRepositoryKeys {
  hydroshare = 'hydroshare',
  zenodo = 'zenodo',
  earthchem = 'earthchem',
  external = 'external',
  openTopography = 'openTopography',
  sesar = 'sesar',
  dryad = 'dryad',
  pangaea = 'pangaea',
  edi = 'edi',
  scienceBase = 'scienceBase',
  osf = 'osf',
  geo = 'geo',
  bioSample = 'bioSample',
  sra = 'sra',
  itrdb = 'itrdb',
  mgds = 'mgds',
  harvardDataverse = 'harvardDataverse',
  figshare = 'figshare',
  magIc = 'magIc',
  ornlDaac = 'ornlDaac',
  bcoDmo = 'bcoDmo',
  vegBank = 'vegBank',
  essDive = 'geo',
  socib = 'socib',
  polarRock = 'polarRock',
  crystalography = 'crystalography',
  digitalRocksPortal = 'digitalRocksPortal',
  doe = 'doe',
  scienceDataBank = 'scienceDataBank',
  tpdc = 'tpdc',
  dataOne = 'dataOne',
  gitHub = 'github',
  ameriFlux = 'ameriflux',
  // other = 'other'
}

export enum EnumSubmissionSorts {
  title = 'Title',
  date = 'Submission Date',
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
  deleteUrl: string,
  fileCreateUrl: string
  fileDeleteUrl: string
  fileReadUrl: string
  folderCreateUrl?: string
  folderReadUrl?: string
  folderDeleteUrl?: string
  moveOrRenameUrl?: string
  accessTokenUrl: string
  authorizeUrl: string
  viewUrl: string
}

export interface IRepository {
  key: EnumRepositoryKeys
  name: string
  logoSrc: string
  description: string
  submitLabel?: string
  urls?: IRepositoryUrls
  schema?: any,
  uischema?: any
  schemaDefaults?: any
  isDisabled?: boolean
  isSupported?: boolean
  isComingSoon?: boolean
  isExternal?: boolean
  hasFolderStructure?: boolean
  url?: string,
  supportUrl?: string,
  submitTooltip?: string
}