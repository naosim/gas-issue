import { Issue } from "../Issue.ts";

export interface IssueListRepository {
  appendRow(issue: Issue): void;
  findCompletedIssueIds(): string[];
  deleteFromList(ids: string[]): void;
}