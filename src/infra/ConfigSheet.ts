import { SpreadSheet, Sheet } from './global.d.ts';

export class ConfigSheet {
  private sheetName = 'config';
  private sheet?: Sheet;
  constructor(private ss: SpreadSheet) {
    this.ss = ss;
    this.create();
  }
  private create() {
    if(this.getSheet()) {
      return // 存在したら何もしない
    }
    var defaults = [
      ['seq', 1, 'ID用のシーケンシャルな番号'],
      ['url', this.ss.getUrl().split('?')[0], 'シートのURL。触らない'],
      ['listSheetName', '一覧', '一覧表示するシートの名前。シート名を手動で変更したらこちらもメンテしてください'],
      ['idprefix', 'I', 'IDのプレフィックス。適宜変更してください'],
      ['zerofillCount', 3, 'IDのゼロ埋めの数。適宜変更してください'],
      ['colums', 'ステータス,タイトル,担当,1行サマリ', '一覧に表示するカラム'],
      ['archiveSpreadSheetId', '', 'アーカイブ先のスプレッドシートIDを指定すると、完了したイシューをそちらに移動できます。（邪魔なイシューがなくなる）'],
    ]
    this.ss.insertSheet(this.sheetName);
    this.getSheet().getRange(1, 1, defaults.length, defaults[0].length).setValues(defaults)
  }

  getSheet(): Sheet {
    if (!this.sheet) {
      this.sheet = this.ss.getSheetByName(this.sheetName);
    }
    return this.sheet;
  }

  createId() {
    var num = this.getSeq();
    var zerofilCount = this.getZerofilCount();
    if (('' + num).length > zerofilCount) {
      throw 'IDが最大値を超えました。zerofilcountを大きくしてください';
    }
    var id = this.getIdPrefix() + (new Array(zerofilCount).fill('0').join('') + num).slice(-zerofilCount);
    this.setSeq(num + 1);
    return id;
  }

  getSeq() {
    return this.getSheet().getRange(1, 2).getValue();
  }

  setSeq(num: string) {
    this.getSheet().getRange(1, 2).setValue(num);
  }

  getUrl() {
    return this.getSheet().getRange(2, 2).getValue();
  }

  getListSheetName(): string {
    return this.getSheet().getRange(3, 2).getValue();
  }

  getIdPrefix() {
    return this.getSheet().getRange(4, 2).getValue();
  }

  getZerofilCount() {
    return this.getSheet().getRange(5, 2).getValue();
  }

  getListColums(): string[] {
    return this.getSheet().getRange(6, 2).getValue().split(',');
  }

  getArchiveSpreadSheetId() {
    var result = this.getSheet().getRange(7, 2).getValue();
    if(!result || result.length == 0) {
      throw 'archiveSpreadSheetIdが設定されていません';
    }
    return result;
  }
}
