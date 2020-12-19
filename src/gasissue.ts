import {ListSheet} from './infra/ListSheet.ts'
import { IssueTemplateSheet } from './infra/IssueTemplateSheet.ts';
import { ConfigSheet } from './infra/ConfigSheet.ts';
import { Service } from "./service/Service.ts";
declare const gasissue: {
  Service: any,
  setup: () => { configSheet: ConfigSheet, listSheet: ListSheet, issueTemplateSheet: IssueTemplateSheet }
};

gasissue.Service = Service;
gasissue.setup = function() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = new ConfigSheet(ss);
  var issueTemplateSheet = new IssueTemplateSheet(ss, configSheet);
  var listSheet = new ListSheet(ss, configSheet, issueTemplateSheet);
  issueTemplateSheet.create(configSheet.getUrl(), listSheet.getSheetId());  
  return { configSheet, listSheet, issueTemplateSheet }
}