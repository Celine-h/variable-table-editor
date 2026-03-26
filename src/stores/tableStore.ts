import { makeAutoObservable } from "mobx";
import type { DataType, VariableItem } from "@/types/variable";
import {
  normalizeBoolValue,
  validateDefaultValue,
  validateName,
} from "@/utils/validators";

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
    this.clearErrorMsg();
  }

  // 设置选中id
  setSelectedRowId(id: string | null) {
    this.selectedRowId = id;
  }

  // 删除行
  deleteRow() {
    if (!this.selectedRowId) {
      this.errorMsg = "Please select a row to delete";
      return
    }
    this.rows = this.rows.filter((e) => e.id !== this.selectedRowId);
    this.clearErrorMsg();
  }

  // 更新name
  updateName(id: string, name: string) {
    const target = this.rows.find((e) => e.id === id);
    if (!target) {
      return false;
    }

    const err = validateName(name, this.rows, id);
    if (err) {
      this.setErrorMsg(err);
      return false;
    }
    target.name = name.trim();
    this.clearErrorMsg();
    return true;
  }

  // 更新DataType
  updateDataType(id: string, dataType: DataType) {
    const target = this.rows.find((e) => e.id === id);
    if (!target) return;
    target.dataType = dataType;
    target.defaultValue = this.getDefaultValueByDataType(dataType); // 填充默认值
    this.clearErrorMsg();
  }

  // 根据数据类型设置默认值
  getDefaultValueByDataType(dataType: DataType) {
    return dataType === "BOOL" ? "TRUE" : "0";
  }

  // 更新默认值
  updateDefaultValue(id: string, nextValue: string): boolean {
    const target = this.rows.find((e) => e.id === id);
    if (!target) {
      return false;
    }

    const err = validateDefaultValue(target.dataType, nextValue);
    if (err) {
      this.setErrorMsg(err);
      return false;
    }

    if (target.dataType === "BOOL") {
      target.defaultValue = normalizeBoolValue(nextValue) as string;
    } else if (target.dataType === "INT") {
      target.defaultValue = String(Number(nextValue.trim()));
    } else {
      target.defaultValue = nextValue;
    }

    this.clearErrorMsg();
    return true;
  }

  // 更新comment
  updateComment(id: string, comment: string) {
    const target = this.rows.find((e) => e.id === id);
    if (!target) return

    target.comment = comment;
  }

  clearErrorMsg() {
    this.errorMsg = "";
  }

  setErrorMsg(msg: string) {
    this.errorMsg = msg;
  }
}

export const tableStore = new TableStore();
