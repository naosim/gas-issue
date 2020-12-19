declare interface Global {
  hoge: string;
}
declare type Sheet = {
  getRange: (r: any, c?: any, rl?: any, cl?: any) => any;
  setColumnWidth: (column: number, width: number) => void;
  setName: (name: string) => void;
  copyTo: (v:any) => Sheet;
  appendRow: (row: Object[]) => any;
  getLastRow: () => number;
  getSheetId: () => string;
  deleteRow: (rowPosition: number) => void;
}
declare type SpreadSheet = {
  getSheetByName: (name: string) => Sheet;
  insertSheet: (name: string) => Sheet;
  addMenu: (label: string, menu: any) => any;
  getUrl: () => string;
};
declare var SpreadsheetApp: {
  getActiveSpreadsheet: () => SpreadSheet;
  openById: (id: string) => SpreadSheet;
}
declare var Browser: any;
