import { Issue } from "../Issue.ts";

export interface IssueRepository {
  createIssue(title: string): Issue;
  archive(id: string): void;
}