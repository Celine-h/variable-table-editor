import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { observer } from "mobx-react-lite";
import type { TableStore } from "@/stores/tableStore";
import type { VariableItem } from "@/types/variable";

interface Iprops {
  store: TableStore;
}

export const EditableTable = observer(({ store }: Iprops) => {
  const columns: ColumnsType<VariableItem> = useMemo(
    () => [
      {
        title: "Index",
        dataIndex: "index",
        key: "index",
        render: (_, __,index) => {
          return <span>{index + 1}</span>;
        },
      },
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Data Type", dataIndex: "dataType", key: "dataType" },
      {
        title: "Default Value",
        dataIndex: "defaultValue",
        key: "defaultValue",
      },
      { title: "Comment", dataIndex: "comment", key: "comment" },
    ],
    [],
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
