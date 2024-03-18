<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component({
  name: 'cz-quick-start-guide',
  components: {},
})
export default class CzQuickStartGuide extends Vue {}
</script>

<template>
  <v-container class="cz-quick-start-guide">
    <div class="text-h4">
      {{ $t("portalName") }} Quickstart Guide
    </div>
    <v-divider class="mb-2" />

    <div class="text-h6 mb-3 mt-6">
      Purpose
    </div>
    <p class="text-body-1">
      The {{ $t("portalName") }} ({{ $t("portalNameShort") }}) is intended to
      streamline the data submission and sharing process for critical zone
      scientists by assisting them in choosing an appropriate data repository,
      walking them through a standard metadata submission form, and directing
      submitted data to an appropriate repository.
    </p>

    <div class="text-h6 mb-3 mt-6">
      Who Should Use the DSP?
    </div>
    <p class="text-body-1">
      The DSP was designed for scientists and others working in the Critical
      Zone who need to submit data to a reputable repository and who want their
      data to be affiliated with one or more CZNet projects or the larger
      Critical Zone scientific community. Data submitted through the DSP are
      deposited into one of our supported repositories (HydroShare, EarthChem,
      or Zenodo). Users who have shared data in other reputable repositories,
      but who want their data to be included in the CZ Hub data discovery system
      can register datasets with the DSP.
    </p>

    <div class="text-h6 mb-3 mt-6">
      Getting Started
    </div>
    <p class="text-body-1">
      The DSP requires an ORCID for login. On the landing page of the DSP, users
      can select “Log In” and be prompted to login using their ORCID. This will
      create a separate window for login where users will enter their email
      address or ORCID and the password associated with their ORCID.
    </p>

    <p class="text-body-1">
      <a href="https://orcid.org/" target="_blank">Register for and learn more about ORCIDs</a>
      <v-icon class="ml-2" small>
        mdi-open-in-new
      </v-icon>
    </p>

    <div class="text-h6 mb-3 mt-6">
      Choosing a Repository
    </div>
    <p class="text-body-1">
      Users can click the “Resources” link at the top of the DSP to access the
      Resources page and then click the “Help Me Decide” button to access a page
      where they can answer a couple of brief questions about the type of data
      they want to submit and get recommendations for repositories they might
      want to consider. If you already know which repository you want to use,
      you can skip this step.
    </p>

    <div class="text-h6 mb-3 mt-6">
      Data Submission
    </div>
    <p class="text-body-1">
      To submit data through the DSP, users can select “Submit data” from the
      top menu in the DSP. You can then select the repository you want to submit
      to (described below). The first time you submit to a repository, you will
      be asked to authorize the repository. Doing so requires that you have a
      user account set up with that repository (e.g., you must have a HydroShare
      account before you can submit to HydroShare through the DSP).
    </p>
    <p class="text-body-1">
      Once authorized, you will be directed to a metadata form to describe the
      data you are submitting. The forms are a little different for each
      repository, but required elements highlighted in red so you know which
      elements you must fill in. We recommend that you fill in as much of the
      metadata as you possibly can.
    </p>

    <div class="text-h6 mb-3 mt-6">
      DSP Supported Repositories
    </div>
    <p class="text-body-1">
      The DSP supports the following repositories for data submission. If you
      have data content to submit, you can submit it directly to these
      repositories through the DSP.
    </p>
    <ul class="text-body-1">
      <li>
        <strong>EarthChem: </strong>EarthChem is a repository that specializes
        in publishing data derived from physical samples.
      </li>
      <li>
        <strong>HydroShare: </strong>HydroShare is a repository that specializes
        in storing data related to water science. HydroShare is file agnostic
        and can support any file type.
      </li>
      <li>
        <strong>Zenodo: </strong>Zenodo is a general-purpose repository that can
        be used for sharing data or other content that might not fit well in
        other repositories.
      </li>
    </ul>

    <div class="text-h6 mb-3 mt-6">
      Registering Datasets That are Not in a Supported Repository
    </div>
    <p class="text-body-1">
      Some CZ researchers are working with partners and multiple funding
      agencies that require submission of data to specific repositories.
      Additionally, researchers may choose repositories other than those
      supported by the DSP for direct data submission. Datasets shared in any
      repository can be registered with the DSP for inclusion in the CZNet data
      discovery catalog and search interface. To do so, click on “Submit Data”
      at the top of the DSP and then select “Register Dataset”. Fill out the
      metadata form to tell us about your CZ-related data.
    </p>

    <div class="text-h6 mb-3 mt-6">
      Tracking Your Submissions
    </div>
    <p class="text-body-1">
      If you click on the “My Submissions” link at the top of the DSP, you will
      be able to see all of the datasets you have submitted to the DSP. On this
      page, you can click links to edit those submissions, view them in the
      repository where they are shared, and/or remove them from the DSP. You can
      also export all of your submissions as a table for reporting purposes.
    </p>
  </v-container>
</template>

<style lang="scss" scoped></style>
