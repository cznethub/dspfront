import { ISubmission, EnumSubmissionStatus, EnumRepositories } from "./types";

const titles = [
  'A really awesome dataset',
  'Another really awesome dataset',
  'Yet another really awesome dataset',
  'Really awesome LiDAR dataset'
]
const repos = [
  EnumRepositories.earthChemLibrary,
  EnumRepositories.hydroShare,
  EnumRepositories.openTopography,
  EnumRepositories.zenodo,
  EnumRepositories.other,
]
const status = [
  EnumSubmissionStatus.draft,
  EnumSubmissionStatus.submitted,
]

const numberOfSubmissions = 50

export const SUBMISSIONS: ISubmission[] = Array.apply(null, Array(numberOfSubmissions)).map(() => {
  return {
    title: getRandomElementFromArray(titles),
    authors: ['Jeffery S. Horsburgh', 'Scott Black', 'Kerstin Lehnert'],
    repository: getRandomElementFromArray(repos),
    date: getRandomDate(),
    status: getRandomElementFromArray(status),
    identifier: 'http://doi.org/hs.xxxxxxx.123456789',
  }
})

function getRandomElementFromArray(array: any[]) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate() {
  const start = new Date(2012, 0, 1)
  const end = new Date()
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}