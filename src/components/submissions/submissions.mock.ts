import { repoMetadata } from "../submit/constants";
import { ISubmission } from "./types";

const titles = [
  'A really awesome dataset',
  'Another really awesome dataset',
  'Yet another really awesome dataset',
  'Really awesome LiDAR dataset'
]

const repos = [
  repoMetadata.hydroshare.name,
  repoMetadata.zenodo.name,
  repoMetadata.earthchem.name,
  // repoMetadata.openTopography.name,
  // repoMetadata.other.name,
]

const numberOfSubmissions = 50

export const SUBMISSIONS: ISubmission[] = Array.apply(null, Array(numberOfSubmissions)).map((el, index) => {
  return {
    id: index,
    title: getRandomElementFromArray(titles),
    authors: [getRandomElementFromArray(['Jeffery S. Horsburgh', 'Scott Black', 'Kerstin Lehnert'])],
    repository: getRandomElementFromArray(repos),
    created: getRandomDate().getTime(),
    lastModified: getRandomDate().getTime(),
    identifier: 'http://doi.org/hs.xxxxxxx.123456789',
    url: 'https://beta.hydroshare.org/resource/72693ac3f5a146fca3b26aee2deefb4a/',
    metadata: {}
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