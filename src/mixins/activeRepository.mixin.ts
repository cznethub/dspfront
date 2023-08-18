import Vue from "vue";
import Repository from "@/models/repository.model";
import { Component } from "vue-property-decorator";
import {
  EnumRepositoryKeys,
  IRepository,
} from "@/components/submissions/types";
import { Subscription } from "rxjs";
import { getRepositoryFromKey } from "@/constants";

@Component
export class ActiveRepositoryMixin extends Vue {
  protected authorizedSubject = new Subscription();

  protected get activeRepository() {
    const key = Repository.$state.submittingTo;
    return getRepositoryFromKey(key) as typeof Repository;
  }

  protected async openAuthorizePopup(repositoryKey: string) {
    const repository = getRepositoryFromKey(repositoryKey) as typeof Repository;
    Repository.authorize(repository); // We don't need to provide a callback because we already have a subject set
  }

  protected setActiveRepository(key: EnumRepositoryKeys) {
    Repository.commit((state) => {
      state.submittingTo = key;
    });
  }

  protected submitTo(repo: IRepository) {
    if (repo.isDisabled) {
      return;
    }

    if (repo.isSupported && !repo.isComingSoon) {
      this.setActiveRepository(repo.key);
      this.$router
        .push({ name: "submit.repository", params: { repository: repo.key } })
        .catch(() => {});
    } else {
      window.open(repo.url, "_blank");
    }
  }

  beforeDestroy() {
    this.authorizedSubject.unsubscribe();
  }
}
