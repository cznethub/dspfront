export interface ISubmission {
  title: string
  authors: string[]
  repository: EnumRepositories
  date: Date
  status: EnumSubmissionStatus
  identifier: string
}

export enum EnumSubmissionStatus {
  draft = 'Draft',
  submitted = 'Submitted'
}

export enum EnumRepositories {
  hydroShare = 'HydroShare',
  earthChemLibrary = 'EarthChem Library',
  zenodo = 'Zenodo',
  openTopography = 'Open Topography',
  sesar = 'System for Earth Sample Registration',
  other = 'other'
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