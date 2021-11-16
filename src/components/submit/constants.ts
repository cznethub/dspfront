import { EnumRepositoryKeys, IRepository } from "@/components/submissions/types";

export const repoMetadata: { [key: string]: IRepository } = {
  [EnumRepositoryKeys.hydroshare]: {
    key: EnumRepositoryKeys.hydroshare,
    name: 'HydroShare',
    logoSrc: require('@/assets/img/hydroshare.png'),
    description: 'HydroShare is a general-purpose domain repository the primarily serves the water science community. HydroShare is operated by the Consortium of Universities for the Advancement of Hydrologic Science, Inc. (CUAHSI). Data types include geographic feature, geographic raster, multidimensional, time series, model programs, model instances, and generic data types.',
  },
  [EnumRepositoryKeys.zenodo]: {
    key: EnumRepositoryKeys.zenodo,
    name: 'Zenodo',
    logoSrc: require('@/assets/img/zenodo.png'),
    description: 'Zenodo is a general-purpose, domain-agnostic repository that serves as a "catch-all" repository for EC funded research. Zenodo is operated by CERN in partnership with the OpenAIRE project.',
  },
  // earthChemLibrary: {
  //   key: 'earthChemLibrary',
  //   name: 'EarthChem Library',
  //   logoSrc: '',
  //   description: 'The EarthChem Library is a domain repository that primarily serves the geochemistry community. The EarthChem Library is operated by the Lamont-Doherty Earth Observatory of Columbia University. Data types include bulk elemental analysis (majors, traces), bulk isotope analysis, mineral analysis (in-situ analysis), melt inclusion analysis, and many more.',
  // },
  // sesar: {
  //   key: 'sesar',
  //   name: 'SESAR',
  //   logoSrc: '',
  //   description: `The System for Earth Sample Registration (SESAR) is a global registry for specimens (rocks, sediments, minerals, fossils, fluids, gas) and related sampling features from our natural environment. SESAR's objective is to overcome the problem of ambiguous sample naming in the Earth Sciences. SESAR maintains a database of sample records that are contributed by its users. Each sample that is registered with SESAR is assigned an International Geo Sample Number IGSN to ensure its global unique identification.`,
  //   submitLabel: 'Register Samples with',
  // },
  // openTopography: {
  //   key: 'openTopography',
  //   name: 'Open Topography',
  //   logoSrc: '',
  //   description: 'Open Topography is a repository for high-resolution, Earth science-oriented, topography and bathymetry data and related tools and resources. Open Topography is operated at the San Diego Supercomputer Center at the University of California San Diego.',
  //   submitLabel: 'Submit LiDAR Data to',
  // },
}