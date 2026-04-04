import { runInAction } from "mobx";
import { tableStore } from "@/stores/tableStore";

describe("TableStore", () => {
  beforeEach(() => {
    runInAction(() => {
      tableStore.rows = [];
      tableStore.selectedRowId = null;
      tableStore.errorMsg = "";
      tableStore.importExportText = "";
    });
  });

  it("initial state has empty rows and no selection", () => {
    // AC1
    expect(tableStore.rows).toEqual([]);
    expect(tableStore.selectedRowId).toBeNull();
    expect(tableStore.errorMsg).toBe("");
    expect(tableStore.importExportText).toBe("");
  });

  it("addRow adds a new row with default values", () => {
    // AC2
    tableStore.addRow();
    expect(tableStore.rows).toHaveLength(1);
    const row = tableStore.rows[0];
    expect(row.name).toBe("");
    expect(row.dataType).toBe("");
    expect(row.defaultValue).toBe("");
    expect(row.comment).toBe("");
  });

  it("deleteRow removes selected row", () => {
    // AC3
    tableStore.addRow();
    tableStore.addRow();
    const firstRowId = tableStore.rows[0].id;
    tableStore.selectedRowId = firstRowId;
    tableStore.deleteRow();
    expect(tableStore.rows).toHaveLength(1);
    expect(tableStore.rows[0].id).not.toBe(firstRowId);
  });

  it("deleteRow shows error when no selection", () => {
    // AC3
    tableStore.deleteRow();
    expect(tableStore.errorMsg).toBe("Please select a row to delete");
  });

  it("updateName validates name is not empty and unique", () => {
    // AC4
    tableStore.addRow();
    tableStore.addRow();
    const firstRowId = tableStore.rows[0].id;
    const secondRowId = tableStore.rows[1].id;

    // Empty name
    expect(tableStore.updateName(firstRowId, "")).toBe(false);
    expect(tableStore.errorMsg).toBe("Name cannot be empty");

    // Valid name
    expect(tableStore.updateName(firstRowId, "counter")).toBe(true);
    expect(tableStore.rows[0].name).toBe("counter");

    // Duplicate name case-insensitive
    expect(tableStore.updateName(secondRowId, "Counter")).toBe(false);
    expect(tableStore.errorMsg).toBe("Name already exists");
  });

  it("updateDataType sets dataType and resets defaultValue", () => {
    // AC5
    tableStore.addRow();
    const rowId = tableStore.rows[0].id;

    tableStore.updateDataType(rowId, "BOOL");
    expect(tableStore.rows[0].dataType).toBe("BOOL");
    expect(tableStore.rows[0].defaultValue).toBe("TRUE");

    tableStore.updateDataType(rowId, "INT");
    expect(tableStore.rows[0].dataType).toBe("INT");
    expect(tableStore.rows[0].defaultValue).toBe("0");
  });

  it("updateDefaultValue validates based on dataType", () => {
    // AC6
    tableStore.addRow();
    const rowId = tableStore.rows[0].id;

    // Set to BOOL
    tableStore.updateDataType(rowId, "BOOL");

    expect(tableStore.updateDefaultValue(rowId, "TRUE")).toBe(true);
    expect(tableStore.rows[0].defaultValue).toBe("TRUE");

    expect(tableStore.updateDefaultValue(rowId, "true")).toBe(true);
    expect(tableStore.rows[0].defaultValue).toBe("TRUE");

    expect(tableStore.updateDefaultValue(rowId, "yes")).toBe(false);
    expect(tableStore.errorMsg).toBe("BOOL default value must be TRUE or FALSE");

    // Set to INT
    tableStore.updateDataType(rowId, "INT");

    expect(tableStore.updateDefaultValue(rowId, "42")).toBe(true);
    expect(tableStore.rows[0].defaultValue).toBe("42");

    expect(tableStore.updateDefaultValue(rowId, "3.14")).toBe(false);
    expect(tableStore.errorMsg).toBe("INT default value must be an integer");

    expect(tableStore.updateDefaultValue(rowId, "9999999999")).toBe(false);
    expect(tableStore.errorMsg).toBe("INT default value is out of range");
  });

  it("getDefaultValueByDataType returns correct defaults", () => {
    // AC7
    expect(tableStore.getDefaultValueByDataType("BOOL")).toBe("TRUE");
    expect(tableStore.getDefaultValueByDataType("INT")).toBe("0");
  });

  it("updateComment sets comment", () => {
    // AC8
    tableStore.addRow();
    const rowId = tableStore.rows[0].id;

    tableStore.updateComment(rowId, "any text");
    expect(tableStore.rows[0].comment).toBe("any text");
  });

  it("importText parses valid VAR text", () => {
    // AC9
    tableStore.importExportText = `VAR\nisReady : bool := FALSE;\ncounter : INT;\nEND_VAR`;

    expect(tableStore.importText()).toBe(true);
    expect(tableStore.rows).toHaveLength(2);
    expect(tableStore.rows[0].name).toBe("isReady");
    expect(tableStore.rows[0].dataType).toBe("BOOL");
    expect(tableStore.rows[0].defaultValue).toBe("FALSE");
    expect(tableStore.rows[1].name).toBe("counter");
    expect(tableStore.rows[1].dataType).toBe("INT");
    expect(tableStore.rows[1].defaultValue).toBe("0");
  });

  it("importText shows error for invalid text", () => {
    // AC10
    tableStore.importExportText = `VAR\nisReady : String := 'test';\ncounter : INT;\nEND_VAR`;

    expect(tableStore.importText()).toBe(false);
    expect(tableStore.errorMsg).toContain("Unsupported data type");

    tableStore.importExportText = `VAR\nisReady Bool false;\nEND_VAR`;
    expect(tableStore.importText()).toBe(false);
    expect(tableStore.errorMsg).toContain("Format error at line 2");
  });

  it("exportAsText generates correct VAR format", () => {
    // AC11
    runInAction(() => {
      tableStore.rows = [
        {
          id: "1",
          name: "isReady",
          dataType: "BOOL",
          defaultValue: "TRUE",
          comment: "System ready flag",
        },
        {
          id: "2",
          name: "counter",
          dataType: "INT",
          defaultValue: "0",
          comment: "Counter",
        },
        {
          id: "3",
          name: "temperature",
          dataType: "INT",
          defaultValue: "",
          comment: "",
        },
      ];
    });

    tableStore.exportAsText();
    expect(tableStore.importExportText).toBe(`VAR\nisReady : BOOL := TRUE; // System ready flag\ncounter : INT := 0; // Counter\ntemperature : INT;\nEND_VAR`);
  });
});