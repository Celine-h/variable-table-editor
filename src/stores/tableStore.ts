import { makeAutoObservable } from "mobx";
import type { VariableItem } from "@/types/variable";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class TableStore {
  rows: VariableItem[] = [];
  selectedRowId: string | null = null; // 选中行Id
  errorMsg: string = ""; // 错误提示信息
  importExportText = ""; // 输入框

  constructor() {
    makeAutoObservable(this);
  }

  // 新增一行
  addRow() {
    this.rows.push({
      id: uid(),
      name: "",
      dataType: "",
      defaultValue: "",
      comment: "",
    });
  }

  // 设置选中id
  setSelectedRowId(id: string | null) {
    this.selectedRowId = id;
  }

  // 删除行
  deleteRow() {
    if (!this.selectedRowId) {
      this.errorMsg = "请选择一行后删除！";
    }
    this.rows = this.rows.filter((e) => e.id !== this.selectedRowId);
    this.errorMsg = "";
  }

  clearErrorMsg() {
    this.errorMsg = "";
  }

  setErrorMsg(msg: string) {
    this.errorMsg = msg;
  }

 
}

export const tableStore = new TableStore();
