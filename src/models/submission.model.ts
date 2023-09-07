import {
  ISubmission,
  EnumRepositoryKeys,
} from "@/components/submissions/types";
import { Model } from "@vuex-orm/core";
import axios from "axios";
import User from "./user.model";
import {
  EnumSubmissionSorts,
  EnumSortDirections,
} from "@/components/submissions/types";
import { itemsPerPageArray } from "@/components/submissions/constants";
import { getRepositoryFromKey } from "@/constants";

const sprintf = require("sprintf-js").sprintf;

export interface ISubmisionState {
  sortBy: { key: string; label: string };
  sortDirection: { key: string; label: string };
  itemsPerPage: number;
  isFetching: boolean;
}

export default class Submission extends Model implements ISubmission {
  // This is the name used as module name of the Vuex Store.
  static entity = "submissions";
  static primaryKey = ["identifier", "repository"];
  public title!: string;
  public authors!: string[];
  public repository!: EnumRepositoryKeys;
  public date!: number;
  public identifier!: string;
  public url!: string;
  public metadata!: any;

  static get $state(): ISubmisionState {
    return this.store().state.entities[this.entity];
  }

  static state() {
    return {
      sortBy: { key: "date", label: EnumSubmissionSorts.date },
      sortDirection: { key: "desc", label: EnumSortDirections.desc },
      itemsPerPage: itemsPerPageArray[0],
      isFetching: false,
    };
  }

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields() {
    return {
      id: this.number(0),
      title: this.attr(""),
      repository: this.attr(""),
      authors: this.attr([]),
      // @ts-ignore
      date: this.number(0),
      identifier: this.attr(""),
      url: this.attr(""),
      metadata: this.attr({}),
      type: this.attr(""),
    };
  }

  static getInsertDataFromDb(dbSubmission) {
    return {
      title: dbSubmission.title,
      authors: dbSubmission.authors,
      repository: dbSubmission.repo_type,
      date: new Date(dbSubmission.submitted).getTime(),
      identifier: dbSubmission.identifier,
      metadata: JSON.parse(dbSubmission.metadata_json),
      url: dbSubmission.url,
    };
  }

  // Note: Do not override the date we stored on creation unless specified. Submissions fetched from repositories might return dates localized to another timezone.
  /** Used to transform submission data that comes from the repository API */
  static getInsertData(
    apiSubmission,
    repository: EnumRepositoryKeys,
    identifier: string,
    overrideDate?: boolean
  ): ISubmission | Partial<Submission> {
    const repo = getRepositoryFromKey(repository);
    const viewUrl = sprintf(repo?.get()?.urls?.viewUrl, identifier);

    if (repository === EnumRepositoryKeys.hydroshare) {
      const data: Partial<Submission> = {
        title: apiSubmission.title,
        authors: apiSubmission.creators.map((c) => c.name),
        repository: repository,
        identifier: identifier,
        url: viewUrl,
        // metadata: {},
      };

      if (overrideDate) {
        data.date = new Date(apiSubmission.created).getTime();
      }

      return data;
    } else if (repository === EnumRepositoryKeys.zenodo) {
      const data: Partial<Submission> = {
        title: apiSubmission.title,
        authors: apiSubmission.creators?.map((c) => c.name),
        repository: repository,
        identifier: identifier,
        url: viewUrl,
      };

      if (overrideDate) {
        // Zenodo returns a date string (e.g. "2022-09-19"), and we need a datetime
        const date = apiSubmission.publication_date.split("-");
        const parsedDate = new Date(Date.UTC(+date[0], +date[1] - 1, +date[2]));
        data.date = parsedDate.getTime();
      }

      return data;
    } else if (repository === EnumRepositoryKeys.earthchem) {
      const data: Partial<Submission> = {
        title: apiSubmission.title,
        authors: [apiSubmission.leadAuthor, ...apiSubmission.contributors].map(
          (a) => `${a.familyName}, ${a.givenName}`
        ),
        repository: repository,
        identifier: identifier,
        url: viewUrl,
      };

      if (overrideDate) {
        // Earthchem returns a date string (e.g. "2022-09-19"), and we need a datetime
        const date = apiSubmission.datePublished.split("-");
        const parsedDate = new Date(Date.UTC(+date[0], +date[1] - 1, +date[2]));
        data.date = parsedDate.getTime();
      }

      return data;
    }
    // else if (repository === EnumRepositoryKeys.external) {
    //   // Not applicable
    // }

    // default
    return {
      title: apiSubmission.title,
      authors: apiSubmission.authors,
      repository: apiSubmission.repo_type,
      date: new Date(apiSubmission.submitted).getTime(),
      identifier: apiSubmission.identifier,
      metadata: {},
    };
  }

  static async fetchSubmissions() {
    console.log("Fetching submissions...");
    try {
      this.commit((state) => {
        return (state.isFetching = true);
      });

      const response = await axios.get("/api/submissions", {
        params: { access_token: User.$state.orcidAccessToken },
      });

      if (response.status === 200) {
        let data = response.data as any[];
        data = data.map(this.getInsertDataFromDb);
        this.insertOrUpdate({ data });
      } else if (response.status === 401) {
        // User has been logged out
        User.logOut();
      }
      this.commit((state) => {
        return (state.isFetching = false);
      });
      return response.status;
    } catch (e: any) {
      this.commit((state) => {
        return (state.isFetching = false);
      });
      return e.response.status;
    }
  }
}
