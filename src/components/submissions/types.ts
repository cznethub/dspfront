export interface CzISubmission {
  title: string
  authors: string[]
  repository: CzEnumRepositories
  date: Date
  status: CzEnumSubmissionStatus
  identifier: string
}

export enum CzEnumSubmissionStatus {
  draft = 'Draft',
  submitted = 'Submitted'
}

export enum CzEnumRepositories {
  hydroShare = 'HydroShare',
  earthChemLibrary = 'EarthChem Library',
  zenodo = 'Zenodo',
  openTopography = 'Open Topography',
  other = 'other'
}