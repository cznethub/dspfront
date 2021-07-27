<template>
  <h1>Zenodo</h1>
  <div class="myform">
    <json-forms
      :data="data"
      :renderers="renderers"
      :schema="schema"
      :uischema="uischema"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue";
import {
  defaultStyles,
  mergeStyles,
  vanillaRenderers,
} from "@jsonforms/vue-vanilla";

// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, { control: { label: "mylabel" } });

const renderers = [
  ...vanillaRenderers,
  // here you can add custom renderers
];

const schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "additionalProperties": false,
  "definitions": {
    "contributor_person_or_org": {
      "additionalProperties": false,
      "properties": {
        "affiliation": {
          "description": "Affiliation for the purpose of this specific record.",
          "type": "string"
        },
        "familyname": {
          "description": "Family name of person if known.",
          "type": "string"
        },
        "givennames": {
          "description": "Given names of person if known.",
          "type": "string"
        },
        "gnd": {
          "description": "Gemeinsame Normdatei identifier for creator.",
          "type": "string"
        },
        "name": {
          "description": "Full name of person or organisation. Personal name format: family, given.",
          "type": "string"
        },
        "orcid": {
          "description": "ORCID identifier for creator.",
          "type": "string"
        },
        "type": {
          "enum": [
            "ContactPerson",
            "DataCollector",
            "DataCurator",
            "DataManager",
            "Distributor",
            "Editor",
            "HostingInstitution",
            "Other",
            "Producer",
            "ProjectLeader",
            "ProjectManager",
            "ProjectMember",
            "RegistrationAgency",
            "RegistrationAuthority",
            "RelatedPerson",
            "Researcher",
            "ResearchGroup",
            "RightsHolder",
            "Sponsor",
            "Supervisor",
            "WorkPackageLeader"
          ],
          "type": "string"
        }
      },
      "required": [
        "name",
        "type"
      ],
      "type": "object"
    },
    "person_or_org": {
      "additionalProperties": false,
      "properties": {
        "affiliation": {
          "description": "Affiliation for the purpose of this specific record.",
          "type": "string"
        },
        "familyname": {
          "description": "Family name of person if known.",
          "type": "string"
        },
        "givennames": {
          "description": "Given names of person if known.",
          "type": "string"
        },
        "gnd": {
          "description": "Gemeinsame Normdatei identifier for creator.",
          "type": "string"
        },
        "name": {
          "description": "Full name of person or organisation. Personal name format: family, given.",
          "type": "string"
        },
        "orcid": {
          "description": "ORCID identifier for creator.",
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "type": "object"
    },
    "relation": {
      "description": "Relation type.",
      "enum": [
        "isCitedBy",
        "cites",
        "isSupplementTo",
        "isSupplementedBy",
        "isContinuedBy",
        "continues",
        "isDescribedBy",
        "describes",
        "hasMetadata",
        "isMetadataFor",
        "isNewVersionOf",
        "isPreviousVersionOf",
        "isPartOf",
        "hasPart",
        "isReferencedBy",
        "references",
        "isDocumentedBy",
        "documents",
        "isCompiledBy",
        "compiles",
        "isVariantFormOf",
        "isOrignialFormOf",
        "isIdenticalTo",
        "isReviewedBy",
        "reviews",
        "isDerivedFrom",
        "isSourceOf",
        "requires",
        "isRequiredBy",
        "isObsoletedBy",
        "obsoletes"
      ],
      "type": "string"
    },
    "scheme": {
      "description": "Persistent identifier scheme.",
      "enum": [
        "ads",
        "ark",
        "arxiv",
        "bioproject",
        "biosample",
        "doi",
        "ean13",
        "ean8",
        "ensembl",
        "genome",
        "gnd",
        "hal",
        "handle",
        "isbn",
        "isni",
        "issn",
        "istc",
        "lsid",
        "orcid",
        "pmcid",
        "pmid",
        "purl",
        "refseq",
        "sra",
        "uniprot",
        "url",
        "urn",
        "swh",
        "ascl"
      ],
      "type": "string"
    }
  },
  "id": "http://zenodo.org/schemas/records/record-v1.0.0.json",
  "properties": {
    "title": {
      "description": "A record title",
      "title": "title",
      "type": "string"
    },
    "description": {
      "description": "descrption of zenodo record",
      "title": "description",
      "type": "string"
    }
  },
  "required": [
    "title"
  ],
  "title": "Zenodo Record Schema v1.0.0",
  "type": "object"
};

export default defineComponent({
  name: "DSP",
  components: {
    JsonForms,
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      data: {},
      schema,
      //uischema,
    };
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    },
  },
  created: function() {
    axios.get("https://localhost:8001/view/zenodo/853465/")
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: 120px;
  margin-right: 120px;
}

.mylabel {
  color: darkslategrey;
}

.vertical-layout {
  margin-left: 10px;
  margin-right: 10px;
}

.myform {
  width: 640px;
  margin: 0 auto;
}

.text-area {
  min-height: 80px;
}
</style>
