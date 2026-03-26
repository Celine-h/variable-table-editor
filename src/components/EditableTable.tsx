import { Input, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import type { TableStore } from "@/stores/tableStore";
import type { VariableItem } from "@/types/variable";
import styles from "./EditableTable.module.scss";

interface Iprops {
  store: TableStore;
}

type Drafts = Record<string, string>;

function makeDraftKey(id: string, field: string) {
  return `${id}-${field}`;
}

export const EditableTable = observer(({ store }: Iprops) => {
  const [drafts, setDrafts] = useState<Drafts>({});

  const getDraft = (id: string, field: string, original: string) => {
    const key = makeDraftKey(id, field);
    return drafts[key] ?? original;
  };

  const setDraft = (id: string, field: string, value: string) => {
    const key = makeDraftKey(id, field);
    setDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const clearDraft = (id: string, field: string) => {
    const key = makeDraftKey(id, field);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const columns: ColumnsType<VariableItem> = useMemo(
    () => [
      {
        title: "Index",
        dataIndex: "index",
        key: "index",
        width: 80,
        render: (_, __, index) => {
          return <span className={styles.automaticCell}>{index + 1}</span>;
        },
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_, record) => {
          return (
            <Input
              aria-label={`name-${record.id}`}
              value={getDraft(record.id, "name", record.name)}
              onChange={(event) =>
                setDraft(record.id, "name", event.target.value)
              }
              onBlur={() => {
                const ok = store.updateName(
                  record.id,
                  getDraft(record.id, "name", record.name),
                );
                if (ok) {
                  clearDraft(record.id, "name");
                }
              }}
            />
          );
        },
      },
      {
        title: "Data Type",
        dataIndex: "dataType",
        key: "dataType",
        width: 160,
        render: (_, record) => {
          return (
            <Select
              aria-label={`dataType-${record.id}`}
              placeholder="Select"
              value={record.dataType || undefined}
              onChange={(value) => {
                store.updateDataType(record.id, value);
                clearDraft(record.id, "defaultValue");
              }}
              options={[
                { value: "BOOL", label: "BOOL" },
                { value: "INT", label: "INT" },
              ]}
              style={{
                width: "100%",
              }}
            ></Select>
          );
        },
      },
      {
        title: "Default Value",
        dataIndex: "defaultValue",
        key: "defaultValue",
        render: (_, record) => {
          return (
            <Input
              aria-label={`default-${record.id}`}
              value={getDraft(record.id, "defaultValue", record.defaultValue)}
              onChange={(event) =>
                setDraft(record.id, "defaultValue", event.target.value)
              }
              onBlur={() => {
                const ok = store.updateDefaultValue(
                  record.id,
                  getDraft(record.id, "defaultValue", record.defaultValue),
                );
                if (ok) {
                  clearDraft(record.id, "defaultValue");
                }
              }}
            />
          );
        },
      },
      {
        title: "Comment",
        dataIndex: "comment",
        key: "comment",
        render: (_, record) => {
          return (
            <Input
              aria-label={`comment-${record.id}`}
              value={getDraft(record.id, "comment", record.comment)}
              onChange={(event) =>
                setDraft(record.id, "comment", event.target.value)
              }
              onBlur={() => {
                store.updateComment(
                  record.id,
                  getDraft(record.id, "comment", record.comment),
                );
                clearDraft(record.id, "comment");
              }}
            />
          );
        },
      },
    ],
    [store, drafts],
  );

  return (
    <Table<VariableItem>
      rowKey="id"
      columns={columns}
      dataSource={store.rows.slice()}
      rowSelection={{
        type: "radio",
        selectedRowKeys: store.selectedRowId ? [store.selectedRowId] : [],
        onChange: (selectedKeys) => {
          const selected = selectedKeys[0];
          store.setSelectedRowId(selected ? String(selected) : null);
        },
      }}
      pagination={false}
    />
  );
});
