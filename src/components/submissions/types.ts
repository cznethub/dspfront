export interface ICzSubmission {
  title: string
  authors: string[]
  repository: EnumCzRepositories
  date: Date
  status: EnumCzSubmissionStatus
  identifier: string
}

export enum EnumCzSubmissionStatus {
  draft = 'Draft',
  submitted = 'Submitted'
}

export enum EnumCzRepositories {
  hydroShare = 'HydroShare',
  earthChemLibrary = 'EarthChem Library',
  zenodo = 'Zenodo',
  openTopography = 'Open Topography',
  other = 'other'
}

export enum EnumCzSubmissionSorts {
  title = 'Title',
  date = 'Most Recent',
  repository = 'Repository',
}

export enum EnumCzSortDirections {
  asc = 'Ascending',
  desc = 'Descending'
}