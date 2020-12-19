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
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import2(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      const e = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(e)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
      return v;
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("domain/Issue", [], function (exports_1, context_1) {
    "use strict";
    var Issue;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Issue = class Issue {
                constructor(id, url) {
                    this.id = id;
                    this.url = url;
                }
            };
            exports_1("Issue", Issue);
        }
    };
});
System.register("domain/repository/IssueListRepository", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("infra/ConfigSheet", [], function (exports_3, context_3) {
    "use strict";
    var ConfigSheet;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            ConfigSheet = class ConfigSheet {
                constructor(ss) {
                    this.ss = ss;
                    this.sheetName = 'config';
                    this.ss = ss;
                    this.create();
                }
                create() {
                    if (this.getSheet()) {
                        return;
                    }
                    var defaults = [
                        ['seq', 1, 'ID用のシーケンシャルな番号'],
                        ['url', this.ss.getUrl().split('?')[0], 'シートのURL。触らない'],
                        ['listSheetName', '一覧', '一覧表示するシートの名前。シート名を手動で変更したらこちらもメンテしてください'],
                        ['idprefix', 'I', 'IDのプレフィックス。適宜変更してください'],
                        ['zerofillCount', 3, 'IDのゼロ埋めの数。適宜変更してください'],
                        ['colums', 'ステータス,タイトル,担当,1行サマリ', '一覧に表示するカラム'],
                        ['archiveSpreadSheetId', '', 'アーカイブ先のスプレッドシートIDを指定すると、完了したイシューをそちらに移動できます。（邪魔なイシューがなくなる）'],
                    ];
                    this.ss.insertSheet(this.sheetName);
                    this.getSheet().getRange(1, 1, defaults.length, defaults[0].length).setValues(defaults);
                }
                getSheet() {
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
                setSeq(num) {
                    this.getSheet().getRange(1, 2).setValue(num);
                }
                getUrl() {
                    return this.getSheet().getRange(2, 2).getValue();
                }
                getListSheetName() {
                    return this.getSheet().getRange(3, 2).getValue();
                }
                getIdPrefix() {
                    return this.getSheet().getRange(4, 2).getValue();
                }
                getZerofilCount() {
                    return this.getSheet().getRange(5, 2).getValue();
                }
                getListColums() {
                    return this.getSheet().getRange(6, 2).getValue().split(',');
                }
                getArchiveSpreadSheetId() {
                    var result = this.getSheet().getRange(7, 2).getValue();
                    if (!result || result.length == 0) {
                        throw 'archiveSpreadSheetIdが設定されていません';
                    }
                    return result;
                }
            };
            exports_3("ConfigSheet", ConfigSheet);
        }
    };
});
System.register("domain/repository/IssueRepository", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("infra/IssueTemplateSheet", ["domain/Issue"], function (exports_5, context_5) {
    "use strict";
    var Issue_ts_1, HEADERCOLOR, IssueTemplateSheet;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (Issue_ts_1_1) {
                Issue_ts_1 = Issue_ts_1_1;
            }
        ],
        execute: function () {
            exports_5("HEADERCOLOR", HEADERCOLOR = '#ddf');
            IssueTemplateSheet = class IssueTemplateSheet {
                constructor(ss, configSheet) {
                    this.ss = ss;
                    this.configSheet = configSheet;
                    this.sheetName = 'テンプレ';
                }
                create(url, listSheetId) {
                    if (this.getSheet()) {
                        return;
                    }
                    var template = {
                        'タイトル': '',
                        '1行サマリ': '',
                        '説明': '',
                        '担当': '',
                        'ステータス': '=IF(COUNTBLANK(B7) = 1, "処理中", "完了")',
                        '作成日': '',
                        '完了日': '',
                    };
                    this.ss.insertSheet(this.sheetName);
                    var issueTemplate = this.getSheet();
                    issueTemplate.getRange(1, 1, Object.keys(template).length, 2).setValues(Object.keys(template).map(function (key) { return [key, template[key]]; }));
                    var headerParamCount = Object.keys(template).length;
                    issueTemplate.getRange(headerParamCount + 2, 1, 1, 2).setValues([['日付', '内容']]);
                    var listUrl = url + '#gid=' + listSheetId;
                    issueTemplate.getRange(1, 3).setValue('=HYPERLINK("' + listUrl + '","一覧へ")');
                    issueTemplate.getRange(1, 1, headerParamCount, 2).setBorder(true, true, true, true, true, true);
                    issueTemplate.getRange(1, 1, headerParamCount, 1).setBackground(HEADERCOLOR);
                    issueTemplate.getRange(headerParamCount + 2, 1, 3, 2).setBorder(true, true, true, true, true, true);
                    issueTemplate.getRange(headerParamCount + 2, 1, 1, 2).setBackground(HEADERCOLOR);
                    issueTemplate.setColumnWidth(2, 600);
                }
                getSheet() {
                    return this.ss.getSheetByName(this.sheetName);
                }
                getCellPosition(key) {
                    var ary = this.getSheet().getRange('A1:A99').getValues();
                    var keys = ary.map(v => v[0]);
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i] == key) {
                            return 'B' + (i + 1);
                        }
                    }
                    throw 'キーが見つかりません: ' + key;
                }
                createIssue(title) {
                    var issueId = this.configSheet.createId();
                    var s = this.ss.getSheetByName(this.sheetName).copyTo(this.ss);
                    s.setName(issueId);
                    s.getRange(this.getCellPosition('タイトル')).setValue(title);
                    s.getRange(this.getCellPosition('作成日')).setValue(new Date());
                    var url = this.configSheet.getUrl() + '#gid=' + s.getSheetId();
                    return new Issue_ts_1.Issue(issueId, url);
                }
                getIssueSheet(id) {
                    return this.ss.getSheetByName(id);
                }
                deleteIssueSheet(id) {
                    this.ss.deleteSheet(this.getIssueSheet(id));
                }
                getArchiveSpreadSheet() {
                    var spreadSheetId = this.configSheet.getArchiveSpreadSheetId();
                    return SpreadsheetApp.openById(spreadSheetId);
                }
                archive(id) {
                    var archivedSheet = this.getIssueSheet(id).copyTo(this.getArchiveSpreadSheet());
                    archivedSheet.setName(id);
                    this.deleteIssueSheet(id);
                }
            };
            exports_5("IssueTemplateSheet", IssueTemplateSheet);
        }
    };
});
System.register("infra/ListSheet", [], function (exports_6, context_6) {
    "use strict";
    var HEADERCOLOR, ListSheet;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            HEADERCOLOR = '#ddf';
            ListSheet = class ListSheet {
                constructor(ss, configSheet, issueTemplateSheet) {
                    this.ss = ss;
                    this.configSheet = configSheet;
                    this.issueTemplateSheet = issueTemplateSheet;
                    this.columns = this.configSheet.getListColums();
                    this.sheetName = this.configSheet.getListSheetName();
                    this.create();
                }
                create() {
                    var columns = [['ID'].concat(this.columns)];
                    if (this.getSheet()) {
                        return;
                    }
                    this.ss.insertSheet(this.sheetName);
                    var listSheet = this.getSheet();
                    listSheet.getRange(1, 1, columns.length, columns[0].length).setValues(columns);
                    listSheet.getRange(1, 1, 1, columns[0].length).setBorder(true, true, true, true, true, true);
                    listSheet.getRange(1, 1, 1, columns[0].length).setBackground(HEADERCOLOR);
                }
                getSheetId() {
                    return this.getSheet().getSheetId();
                }
                getSheet() {
                    if (!this.sheet) {
                        this.sheet = this.ss.getSheetByName(this.sheetName);
                    }
                    return this.sheet;
                }
                appendRow(issue) {
                    var ary = this.columns.map(v => "='" + issue.id + "'!" + this.issueTemplateSheet.getCellPosition(v));
                    var row = ['=HYPERLINK("' + issue.url + '","' + issue.id + '")'].concat(ary);
                    var sheet = this.getSheet();
                    sheet.appendRow(row);
                    sheet.getRange(1, 1, sheet.getLastRow(), row.length).setBorder(true, true, true, true, true, true);
                }
                getStatusColumnIndex() {
                    for (var i = 0; i < this.columns.length; i++) {
                        if (this.columns[i] == 'ステータス') {
                            return i + 1;
                        }
                    }
                    throw 'ステータスのカラムが見つからない';
                }
                findCompletedIssueIds() {
                    var sheet = this.getSheet();
                    var ary = this.getSheet().getRange(1, 1, sheet.getLastRow(), this.columns.length + 1).getValues();
                    return ary.filter(v => v[this.getStatusColumnIndex()] == '完了').map(v => v[0]);
                }
                getColumnLength() {
                    return this.columns.length + 1;
                }
                deleteFromList(ids) {
                    var idMap = ids.reduce((memo, v) => {
                        memo[v] = true;
                        return memo;
                    }, {});
                    var sheet = this.getSheet();
                    var ary = sheet.getRange(1, 1, sheet.getLastRow(), this.getColumnLength()).getValues();
                    for (var i = ary.length - 1; i >= 0; i--) {
                        var id = ary[i][0];
                        if (idMap[id]) {
                            sheet.deleteRow(i + 1);
                        }
                    }
                }
            };
            exports_6("ListSheet", ListSheet);
        }
    };
});
System.register("service/Service", [], function (exports_7, context_7) {
    "use strict";
    var Service;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            Service = class Service {
                constructor(issueRepository, issueListRepository) {
                    this.issueRepository = issueRepository;
                    this.issueListRepository = issueListRepository;
                }
                createIssue(title) {
                    var issue = this.issueRepository.createIssue(title);
                    this.issueListRepository.appendRow(issue);
                }
                archive() {
                    var ids = this.issueListRepository.findCompletedIssueIds();
                    ids.forEach(id => this.issueRepository.archive(id));
                    this.issueListRepository.deleteFromList(ids);
                }
            };
            exports_7("Service", Service);
        }
    };
});
System.register("gasissue", ["infra/ListSheet", "infra/IssueTemplateSheet", "infra/ConfigSheet", "service/Service"], function (exports_8, context_8) {
    "use strict";
    var ListSheet_ts_1, IssueTemplateSheet_ts_1, ConfigSheet_ts_1, Service_ts_1;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (ListSheet_ts_1_1) {
                ListSheet_ts_1 = ListSheet_ts_1_1;
            },
            function (IssueTemplateSheet_ts_1_1) {
                IssueTemplateSheet_ts_1 = IssueTemplateSheet_ts_1_1;
            },
            function (ConfigSheet_ts_1_1) {
                ConfigSheet_ts_1 = ConfigSheet_ts_1_1;
            },
            function (Service_ts_1_1) {
                Service_ts_1 = Service_ts_1_1;
            }
        ],
        execute: function () {
            gasissue.Service = Service_ts_1.Service;
            gasissue.setup = function () {
                var ss = SpreadsheetApp.getActiveSpreadsheet();
                var configSheet = new ConfigSheet_ts_1.ConfigSheet(ss);
                var issueTemplateSheet = new IssueTemplateSheet_ts_1.IssueTemplateSheet(ss, configSheet);
                var listSheet = new ListSheet_ts_1.ListSheet(ss, configSheet, issueTemplateSheet);
                issueTemplateSheet.create(configSheet.getUrl(), listSheet.getSheetId());
                return { configSheet, listSheet, issueTemplateSheet };
            };
        }
    };
});

__instantiate("gasissue", false);
