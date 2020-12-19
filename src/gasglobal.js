var gasissue = {};

function setup() {
  gasissue.setup();
}

function onOpen() {
  SpreadsheetApp
    .getActiveSpreadsheet()
    .addMenu('課題管理', [
      {name: '課題作成', functionName: 'createIssue'},
      {name: '完了済をアーカイブ', functionName: 'archive'}
    ]);
}

function createIssue() {
  var title = Browser.inputBox('タイトル', '', Browser.Buttons.OK_CANCEL)
  if(title == 'cancel') {
    return;
  }
  if(!title || title.trim().length == 0) {
    throw 'タイトルを決めてください';
  }

  var sheets = gasissue.setup();
  new gasissue.Service(
    sheets.issueTemplateSheet,
    sheets.listSheet
  ).createIssue(title);
}

function archive() {
  var sheets = gasissue.setup();
  new gasissue.Service(
    sheets.issueTemplateSheet,
    sheets.listSheet
  ).archive();
}

function import2() {
  throw 'システムエラー: import2が呼ばれた'
}
