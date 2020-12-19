import { Issue } from "../domain/Issue.ts";
import { IssueListRepository } from "../domain/repository/IssueListRepository.ts";
import { ConfigSheet } from "./ConfigSheet.ts";
import {SpreadSheet, Sheet} from './global.d.ts'
import { IssueTemplateSheet } from "./IssueTemplateSheet.ts";
var HEADERCOLOR = '#ddf'

export class ListSheet implements IssueListRepository{
  private sheetName: string;
  private sheet?: Sheet;
  private columns: string[]
  constructor(
    private ss: SpreadSheet,
    private configSheet: ConfigSheet,
    private issueTemplateSheet: IssueTemplateSheet
  ) {
    this.columns = this.configSheet.getListColums();
    this.sheetName = this.configSheet.getListSheetName();
    this.create();
  }
  
  private create() {
    var columns = [['ID'].concat(this.columns)];
    if(this.getSheet()) {
      return; // 存在したら何もしない
    }
    this.ss.insertSheet(this.sheetName);
    var listSheet = this.getSheet();
    listSheet.getRange(1, 1, columns.length, columns[0].length).setValues(columns)
    listSheet.getRange(1, 1, 1, columns[0].length).setBorder(true, true, true, true, true, true)
    listSheet.getRange(1, 1, 1, columns[0].length).setBackground(HEADERCOLOR);
  }

  getSheetId(): string {
    return this.getSheet().getSheetId();
  }
  
  getSheet(): Sheet {
    if(!this.sheet) {
      this.sheet = this.ss.getSheetByName(this.sheetName)
    }
    return this.sheet;
  }
  
  appendRow(issue: Issue) {
    var ary = this.columns.map(v => "='" + issue.id + "'!" + this.issueTemplateSheet.getCellPosition(v));
    var row = ['=HYPERLINK("' + issue.url + '","' + issue.id + '")'].concat(ary)
    var sheet = this.getSheet();
    sheet.appendRow(row);
    sheet.getRange(1, 1, sheet.getLastRow(), row.length).setBorder(true, true, true, true, true, true)
  }

  private getStatusColumnIndex(): number {
    for(var i = 0; i < this.columns.length; i++) {
      if(this.columns[i] == 'ステータス') {
        return i + 1 /* IDのカラム分を加える */
      }
    }
    throw 'ステータスのカラムが見つからない';
  }

  findCompletedIssueIds(): string[] {
    var sheet = this.getSheet();
    var ary: Object[][] = this.getSheet().getRange(1, 1, sheet.getLastRow(), this.columns.length + 1 /* IDとその他カラム*/).getValues();
    return ary.filter(v => v[this.getStatusColumnIndex()] == '完了').map(v => v[0] as string /* ID */)
  }

  getColumnLength() {
    return this.columns.length + 1; /* IDカラム分を加える */
  }

  deleteFromList(ids: string[]): void {
    var idMap = ids.reduce((memo, v) => {
      memo[v] = true;
      return memo;
    }, {} as {[key: string]: boolean})

    var sheet = this.getSheet();
    var ary: string[][] = sheet.getRange(1, 1, sheet.getLastRow(), this.getColumnLength()).getValues();
    
    // 削除するとトルツメになるため、下から削除していく
    for(var i = ary.length - 1; i >= 0; i--) {
      var id = ary[i][0];
      if(idMap[id]) {
        sheet.deleteRow(i + 1);//iはゼロオリジン、引数は1オリジン
      }
    }
  }
}