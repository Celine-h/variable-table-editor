import { observer } from "mobx-react-lite";
import styles from "./index.module.scss";
import { Alert, Button, Input, Space, Typography } from "antd";
import { EditableTable } from "@/components/EditableTable";
import { tableStore } from "@/stores/tableStore";

const HomePage = observer(() => {
  const store = tableStore;
  return (
    <div className={styles.container}>
      <Typography.Title>Variable Table Editor</Typography.Title>
      {store.errorMsg && (
        <Alert
          type="error"
          description={store.errorMsg}
          onClose={() => {
            store.clearErrorMsg();
          }}
        />
      )}

      <Space style={{ margin: '15px 0' }}>
        <Button type="primary" onClick={() => store.addRow()}>
          Add Row
        </Button>
        <Button type="default" danger onClick={() => store.deleteRow()}>
          Delete Row
        </Button>
      </Space>

      <EditableTable store={store} />
      <Input.TextArea
        style={{ margin: "15px 0" }}
        value={store.importExportText}
        onChange={(e)=>{store.setTextAreaValue(e.target.value)}}
        autoSize={{ minRows: 6, maxRows: 12 }}
        placeholder="Paste VAR...END_VAR text here"
      />
      <Space>
        <Button onClick={()=>{store.importText()}}>Import</Button>
        <Button onClick={() => store.exportAsText()}>Export</Button>
      </Space>
    </div>
  );
});

export default HomePage;
