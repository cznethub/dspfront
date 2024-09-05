## Repository Recommendations

The Repository recommendations system follows a decision tree structure described by a JSON object. A decision branch is composed of multiple nodes and each node is an `Option` object that can have the following properties:

### Option

| Property  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`    | A string representing the question that must be answered next before proceeding.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `options` | An array of objects (`Option`) to chose from to answer the question.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `label`   | A string describing the title of the current option.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `finish`  | An object that marks the end of the current branch in the decision tree. Can have the following properties: <br> - `prefer`: An array of repository identifiers to recommend at the end of this decision branch. These are featured at the top of the recommendations. See [Repositories](https://github.com/cznethub/dspfront/blob/develop/src/components/submit/constants.ts). <br>- `consider`: An array of repository identifiers to also consider at the end of this decision branch. These are featured in a separate section below the prefered recommendations. See [Repositories](https://github.com/cznethub/dspfront/blob/develop/src/components/submit/constants.ts).<br> - `linkToGuide`: A string key referencing the guide to link to at the end of this decision branch. See [Guides](https://github.com/cznethub/dspfront/blob/develop/src/components/recommendations/constants.ts). |

Example:

```
{
  "next": "What category of data do you want to submit?",
  "options": [
        {
      "label": "Metadata About Physical Samples",
      "finish": {
        "prefer": [
          "sesar"
        ],
        "consider": []
      }
    },
    {
      "label": "Geochemistry",
      "next": "What type of data will you be submitting?",
      "options": [
        {
          "label": "Metadata about physical samples",
          "finish": {
            "prefer": [
              "sesar"
            ],
            "consider": [],
            "linkToGuide": "sampleRegistration"
          }
        },
        {
          "label": "Field measurements / experiments / samples",
          "finish": {
            "prefer": [
              "earthchem"
            ],
            "consider": [
              "edi"
            ],
            "linkToGuide": "sampleData"
          }
        },
        {
          "label": "Time series data / sensor data",
          "finish": {
            "prefer": [
              "hydroshare"
            ],
            "consider": [
              "zenodo"
            ],
            "linkToGuide": "timeSeriesData"
          }
        },
        {
          "label": "Laboratory analyses of samples",
          "finish": {
            "prefer": [
              "earthchem"
            ],
            "consider": [],
            "linkToGuide": "sampleData"
          }
        },
        {
          "label": "Model programs or instances",
          "finish": {
            "prefer": [
              "hydroshare"
            ],
            "consider": [
              "github"
            ]
          }
        }
      ]
    }
  ]
}
```
