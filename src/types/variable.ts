export type DataType = "BOOL" | "INT";

export interface VariableItem {
  id: string;
  name: string;
  dataType: DataType | "";
  defaultValue: string;
  comment: string;
}
