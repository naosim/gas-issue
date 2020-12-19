import { Issue } from "../domain/Issue.ts";
import { IssueRepository } from "../domain/repository/IssueRepository.ts";
import { ConfigSheet } from "./ConfigSheet.ts";
import {SpreadSheet} from './global.d.ts'
export var HEADERCOLOR = '#ddf'

export class IssueTemplateSheet implements IssueRepository {
  private sheetName = 'テンプレ';
  
  constructor(private ss: SpreadSheet, private configSheet: ConfigSheet) {
  }

  create(url: string, listSheetId: string) {
    if(this.getSheet()) {
      return // 存在したら何もしない
    }
    var template: {[key: string]: string} = {
      'タイトル': '',
      '1行サマリ': '',
      '説明': '',    
      '担当': '',    
      'ステータス': '=IF(COUNTBLANK(B7) = 1, "処理中", "完了")',
      '作成日': '',
      '完了日': '',
    }
    this.ss.insertSheet(this.sheetName);
    var issueTemplate = this.getSheet();
    issueTemplate.getRange(1, 1, Object.keys(template).length, 2).setValues(Object.keys(template).map(function(key) { return [key, template[key]]}))
    var headerParamCount = Object.keys(template).length;

    issueTemplate.getRange(headerParamCount + 2, 1, 1, 2).setValues([['日付','内容']])    
    var listUrl = url + '#gid=' + listSheetId;
  
    issueTemplate.getRange(1, 3).setValue('=HYPERLINK("' + listUrl + '","一覧へ")');
    issueTemplate.getRange(1, 1, headerParamCount, 2).setBorder(true, true, true, true, true, true);
    issueTemplate.getRange(1, 1, headerParamCount, 1).setBackground(HEADERCOLOR);
    issueTemplate.getRange(headerParamCount + 2, 1, 3, 2).setBorder(true, true, true, true, true, true);
    issueTemplate.getRange(headerParamCount + 2, 1, 1, 2).setBackground(HEADERCOLOR);
    issueTemplate.setColumnWidth(2, 600);
  }

  getSheet(): Sheet {
    return this.ss.getSheetByName(this.sheetName);
  }

  getCellPosition(key: string): string {
    var ary: string[][] = this.getSheet().getRange('A1:A99').getValues()
    var keys = ary.map(v => v[0]);
    for(var i = 0; i < keys.length; i++) {
      if(keys[i] == key) {
        return 'B' + (i + 1);
      }
    }
    throw 'キーが見つかりません: ' + key;
  }

  createIssue(title: string): Issue {
    var issueId = this.configSheet.createId();
    var s = this.ss.getSheetByName(this.sheetName).copyTo(this.ss);
    s.setName(issueId);
    s.getRange(this.getCellPosition('タイトル')).setValue(title);
    s.getRange(this.getCellPosition('作成日')).setValue(new Date());
    var url = this.configSheet.getUrl() + '#gid=' + s.getSheetId()
    return new Issue(issueId, url);
  }

  getIssueSheet(id: string): Sheet {
    return this.ss.getSheetByName(id);
  }

  /**
   * シートを削除する
   * @param id 
   */
  deleteIssueSheet(id: string) {
    this.ss.deleteSheet(this.getIssueSheet(id))
  }

  /**
   * アーカイブ先のスプレッドシートを取得する
   */
  getArchiveSpreadSheet() {
    var spreadSheetId = this.configSheet.getArchiveSpreadSheetId()
    return SpreadsheetApp.openById(spreadSheetId);
  }

  /**
   * アーカイブする
   * @param id 
   */
  archive(id: string): void {
    var archivedSheet = this.getIssueSheet(id).copyTo(this.getArchiveSpreadSheet());
    archivedSheet.setName(id);// コピーするとシート名が「xxのコピー」になるため、ID名に変更する
    this.deleteIssueSheet(id);
  }
}
