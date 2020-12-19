import { Issue } from "../domain/Issue.ts";
import { IssueListRepository } from "../domain/repository/IssueListRepository.ts";
import { IssueRepository } from "../domain/repository/IssueRepository.ts";

export class Service {
  constructor(
    private issueRepository: IssueRepository,
    private issueListRepository: IssueListRepository
  ) {
  }

  createIssue(title: string) {
    var issue:Issue = this.issueRepository.createIssue(title);
    this.issueListRepository.appendRow(issue);
  }

  archive() {
    var ids = this.issueListRepository.findCompletedIssueIds();
    ids.forEach(id => this.issueRepository.archive(id));
    this.issueListRepository.deleteFromList(ids);
  }

}