<template>
  <div v-if="loggedIn">
    <a href="/api/logout" class="button">Logout</a>
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
  </div>
  <div v-else>
    <a href="/api/login" class="button">Login</a>
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
  "description": "Describe information needed for deposit module.",
  "id": "http://zenodo.org/schemas/deposits/records/legacyjson.json",
  "properties": {
    //"$schema": {
    //  "type": "string"
    //},
    //"access_conditions": {
    //  "description": "Conditions under which access is given if record is restricted.",
    //  "title": "Access conditions",
    //  "type": "string"
    //},
    "access_right": {
      "default": "open",
      "description": "Access right for record.",
      "enum": [
        "open",
        "embargoed",
        "restricted",
        "closed"
      ],
      "type": "string"
    },
    "communities": {
      "description": "List of community identifiers.",
      "items": {
        "additionalProperties": false,
        "properties": {
          "identifier": {
            "type": "string"
          }
        },
        "type": "object"
      },
      "type": "array"
    },
    "contributors": {
      "description": "Contributors in order of importance.",
      "items": {
        "additionalProperties": false,
        "properties": {
          "affiliation": {
            "description": "Affiliation for the purpose of this specific record.",
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
              "ResearchGroup",
              "RightsHolder",
              "Researcher",
              "Sponsor",
              "Supervisor",
              "WorkPackageLeader"
            ],
            "type": "string"
          }
        },
        "type": "object"
      },
      "title": "Contributors",
      "type": "array"
    },
    "creators": {
      "description": "Creators of record in order of importance.",
      "items": {
        "additionalProperties": false,
        "properties": {
          "affiliation": {
            "description": "Affiliation for the purpose of this specific record.",
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
        "type": "object"
      },
      "type": "array"
    },
    "description": {
      "description": "Description/abstract for record.",
      "type": "string"
    },
    "doi": {
      "description": "Digital Object Identifier (DOI).",
      "type": "string"
    },
    "embargo_date": {
      "description": "Embargo date of record (ISO8601 formatted date).",
      "title": "Embargo Date",
      "type": "string"
    },
    "grants": {
      "description": "Source of grants/awards which have funded all or part of this particular record.",
      "items": {
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string"
          }
        },
        "type": "object"
      },
      "type": "array"
    },
    "imprint_isbn": {
      "type": "string"
    },
    "imprint_place": {
      "type": "string"
    },
    "imprint_publisher": {
      "type": "string"
    },
    "journal_issue": {
      "description": "Journal issue.",
      "title": "Journal issue",
      "type": "string"
    },
    "journal_pages": {
      "description": "Journal page(s).",
      "title": "Journal page(s)",
      "type": "string"
    },
    "journal_title": {
      "description": "Journal title.",
      "title": "Journal title",
      "type": "string"
    },
    "journal_volume": {
      "description": "Journal volume.",
      "title": "Journal volume",
      "type": "string"
    },
    "keywords": {
      "description": "Free text keywords.",
      "items": {
        "title": "Keyword",
        "type": "string"
      },
      "title": "Keywords",
      "type": "array"
    },
    "license": {
      "description": "License for embargoed/open access content.",
      "title": "License",
      "type": "string",
      "default": "CC-BY-4.0"
    },
    "conference_acronym": {
      "title": "Acronym",
      "type": "string"
    },
    "conference_dates": {
      "title": "Dates",
      "type": "string"
    },
    "conference_place": {
      "title": "Place",
      "type": "string"
    },
    "conference_session": {
      "title": "Session",
      "type": "string"
    },
    "conference_session_part": {
      "title": "Part of session",
      "type": "string"
    },
    "conference_title": {
      "title": "Title",
      "type": "string"
    },
    "conference_url": {
      "title": "URL",
      "type": "string"
    },
    "notes": {
      "description": "Additional notes for record.",
      "title": "Additional notes",
      "type": "string"
    },
    "partof_pages": {
      "title": "Pages",
      "type": "string"
    },
    "partof_title": {
      "title": "Title",
      "type": "string"
    },
    "publication_date": {
      "description": "Record publication date (IS8601-formatted). EDTF support to be added for field.",
      "type": "string"
    },
    "references": {
      "description": "Raw textual references when identifier is not known.",
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "related_identifiers": {
      "description": "Related research outputs.",
      "items": {
        "properties": {
          "identifier": {
            "description": "Identifier of research output.",
            "type": "string"
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
              "isAlternateIdentifier",
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
          },
          "resource_type": {
            "type": "string"
          }
        },
        "type": "object"
      },
      "type": "array"
    },
    "upload_type": {
      "additionalProperties": false,
      "default": "publication",
      "description": "Record upload type.",
      "enum": [
        "publication",
        "poster",
        "presentation",
        "dataset",
        "image",
        "video",
        "software",
        "lesson",
        "physicalobject",
        "other"
      ],
      "type": "string"
    },
    "publication_type": {
      "additionalProperties": false,
      "description": "Publication type.",
      "default": "article",
      "enum": [
        "book",
        "section",
        "conferencepaper",
        "article",
        "patent",
        "preprint",
        "report",
        "deliverable",
        "milestone",
        "proposal",
        "softwaredocumentation",
        "thesis",
        "technicalnote",
        "workingpaper",
        "datamanagementplan",
        "annotationcollection",
        "taxonomictreatment",
        "other"
      ],
      "type": "string"
    },
    "image_type": {
      "additionalProperties": false,
      "default": "figure",
      "description": "Image type.",
      "enum": [
        "figure",
        "plot",
        "drawing",
        "diagram",
        "photo",
        "other"
      ],
      "type": "string"
    },
    "openaire_type": {
      "type": "string",
      "descritpion": "OpenAIRE type."
    },
    "subjects": {
      "description": "Subjects from specific vocabularies.",
      "items": {
        "additionalProperties": false,
        "properties": {
          "identifier": {
            "description": "Subjects term identifier.",
            "type": "string"
          },
          "scheme": {
            "description": "Identifier scheme.",
            "type": "string"
          },
          "term": {
            "description": "Subject term value.",
            "type": "string"
          }
        },
        "type": "object"
      },
      "type": "array"
    },
    "thesis_supervisors": {
      "description": "Supervisors of thesis in order of importance.",
      "items": {
        "additionalProperties": false,
        "properties": {
          "affiliation": {
            "description": "Affiliation for the purpose of this specific record.",
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
        "type": "object"
      },
      "type": "array"
    },
    "thesis_university": {
      "description": "Awarding university in case of a thesis.",
      "type": "string"
    },
    "title": {
      "description": "Record title.",
      "type": "string"
    }
  },
  "title": "Zenodo Legacy Deposit Schema v1.0.0",
  "type": "object"
}
;

function readCookie(cname: string) {
  const name = cname + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

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
  computed: {
    loggedIn: function () {
      return readCookie("Authorization");
    }
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    },
    getCookie(){
      alert("hello world");
      const authorization = readCookie("Authorization");
      alert(authorization);
    }
  },
  created: function() {
    //axios.get("https://localhost:8001/view/zenodo/853465/")
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
