import { fireEvent, render, screen } from "@testing-library/react";
import HomePage from "@/pages/index";
import { tableStore } from "@/stores/tableStore";
import { values } from "mobx";
import { uid } from "@/utils/util";
describe("HomePage", () => {
  beforeEach(() => {
    tableStore.rows = [];
    tableStore.selectedRowId = null;
    tableStore.errorMsg = "";
    tableStore.importExportText = "";
  });
  it("Table an empty table with expected columns and core buttons", () => {
    // AC1
    render(<HomePage />);
    expect(screen.getByText("Index")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Data Type")).toBeInTheDocument();
    expect(screen.getByText("Default Value")).toBeInTheDocument();
    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(screen.getByText("Add Row")).toBeInTheDocument();
    expect(screen.getByText("Delete Row")).toBeInTheDocument();
    expect(screen.getByText("Import")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("add row when click Add Row", () => {
    // AC2
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(3);
  });

  it("deletes selected row when clicking Delete Row", () => {
    // AC3
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]);
    fireEvent.click(screen.getByText("Delete Row"));
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("shows error when deleting without selection", () => {
    // AC3: Delete Row - no selection shows error
    render(<HomePage />);
    fireEvent.click(screen.getByText("Delete Row"));
    expect(
      screen.getAllByText("Please select a row to delete").length,
    ).toBeGreaterThan(0);
  });

  it("index column is read-only and automatically generated, max index+1, recalculates after delete", () => {
    // AC2&AC3
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));
    fireEvent.click(screen.getByText("Add Row"));
    fireEvent.click(screen.getByText("Add Row"));

    const automaticCells = screen
      .getAllByText(/^\d+$/)
      .filter((e) => e.className.includes("automaticCell"));
    expect(automaticCells[0]).toHaveTextContent("1");
    expect(automaticCells[1]).toHaveTextContent("2");
    expect(automaticCells[2]).toHaveTextContent("3");

    expect(automaticCells[0].tagName).toBe("SPAN");

    // delete second row and recaculate index
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);
    fireEvent.click(screen.getByText("Delete Row"));

    const automaticCellsAfterDelete = screen
      .getAllByText(/^\d+$/)
      .filter((e) => e.className.includes("automaticCell"));
    expect(automaticCellsAfterDelete).toHaveLength(2);
    expect(automaticCellsAfterDelete[0]).toHaveTextContent("1");
    expect(automaticCellsAfterDelete[1]).toHaveTextContent("2");
  });

  it("validate name is not empty and unique case-insensitive", () => {
    // AC4
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));
    fireEvent.click(screen.getByText("Add Row"));

    const nameInputs = screen.getAllByLabelText(/^name-/);
    fireEvent.change(nameInputs[0], { target: { value: "" } });
    fireEvent.blur(nameInputs[0]); // validate on blur
    expect(screen.getByText("Name cannot be empty")).toBeInTheDocument();

    fireEvent.change(nameInputs[0], { target: { value: "counter" } });
    fireEvent.blur(nameInputs[0]);
    fireEvent.change(nameInputs[1], { target: { value: "Counter" } });
    fireEvent.blur(nameInputs[1]);
    expect(screen.getByText("Name already exists")).toBeInTheDocument();
  });

  it("changing data type resets default value", () => {
    // AC5
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));

    const row = tableStore.rows[0];

    tableStore.updateDataType(row.id, "BOOL");
    expect(row.defaultValue).toBe("TRUE");

    tableStore.updateDataType(row.id, "INT");
    expect(row.defaultValue).toBe("0");
  });

  it("validate case-insensitive default value when DataType is BOOL or INT", () => {
    // AC6
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));

    const row = tableStore.rows[0];
    // dataType BOOL
    tableStore.updateDataType(row.id, "BOOL");

    tableStore.updateDefaultValue(row.id, "TRUE"); // case-insensitive
    expect(row.defaultValue).toBe("TRUE");

    tableStore.updateDefaultValue(row.id, "true"); // case-insensitive
    expect(row.defaultValue).toBe("TRUE");

    tableStore.updateDefaultValue(row.id, "yes");
    expect(tableStore.errorMsg).toBe(
      "BOOL default value must be TRUE or FALSE",
    );

    // dataType INT
    tableStore.updateDataType(row.id, "INT");

    tableStore.updateDefaultValue(row.id, "42");
    expect(row.defaultValue).toBe("42");

    tableStore.updateDefaultValue(row.id, "3.14");
    expect(tableStore.errorMsg).toBe("INT default value must be an integer");

    tableStore.updateDefaultValue(row.id, "9999999999");
    expect(tableStore.errorMsg).toBe("INT default value is out of range");
  });

  it("edit comment", () => {
    // AC8
    render(<HomePage />);
    fireEvent.click(screen.getByText("Add Row"));

    const commentInputs = screen.getAllByLabelText(/^comment-/);

    fireEvent.change(commentInputs[0], { target: { value: "any text" } });
    fireEvent.blur(commentInputs[0]);
    expect(commentInputs[0]).toHaveValue("any text");
  });

  it("imports valid text", () => {
    // AC9
    render(<HomePage />);
    const textArea = screen.getByPlaceholderText(
      "Paste VAR...END_VAR text here",
    );
    fireEvent.change(textArea, {
      target: {
        value: `VAR\nisReady : bool := FALSE;\ncounter : INT;\nEND_VAR`,
      },
    });
    fireEvent.click(screen.getByText("Import"));
    const defaultInputs = screen.getAllByLabelText(/^default-/);
    expect(defaultInputs[0]).toHaveValue("FALSE");
    expect(defaultInputs[1]).toHaveValue("0");
  });

  it("imports invalid text and shows error", () => {
    // AC10
    render(<HomePage />);
    const textArea = screen.getByPlaceholderText(
      "Paste VAR...END_VAR text here",
    );
    fireEvent.change(textArea, {
      target: {
        value: `VAR\nisReady : String := 'test';\ncounter : INT;\nEND_VAR`,
      },
    });
    fireEvent.click(screen.getByText("Import"));
    expect(screen.getByText(/Unsupported data type/)).toBeInTheDocument();

    fireEvent.change(textArea, {
      target: { value: `VAR\nisReady Bool false;\nEND_VAR` },
    });
    fireEvent.click(screen.getByText("Import"));
    expect(
      screen.getByText(/Format error at line 2, cannot parse/),
    ).toBeInTheDocument();
  });

  it("export to standard text format", () => {
    // AC11
    render(<HomePage />);
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

    fireEvent.click(screen.getByText('Export'))

    const textArea = screen.getByPlaceholderText('Paste VAR...END_VAR text here');
    expect(textArea).toHaveValue(`VAR\nisReady : BOOL := TRUE; // System ready flag\ncounter : INT := 0; // Counter\ntemperature : INT;\nEND_VAR`);

   
  });
});
