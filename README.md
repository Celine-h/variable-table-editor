# Variable Table Editor（变量表格编辑器）

技术栈：`Umi4 + React + Ts + Mobx + Sass + Antd `实现项目搭建、基础功能以及状态管理，`Jest + React-Test-Library`实现单元测试。

git地址：https://github.com/Celine-h/variable-table-editor.git


## 本地启动

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:8000`。


## 单元测试

```bash
npm test
```

## 项目结构
- `src/pages/index.tsx`: 页面入口、操作按钮和可编辑表格导入
- `src/components/EditableTable.tsx`: 基于 `antd-Table` 的可编辑表格，可以实现表格单选
- `src/stores/tableStore.ts`:全局状态管理
- `src/utils/validators.ts`: 输入校验
- `src/utils/format.ts`: 导入导出格式转换
- `src/styles/*.scss`: 全局样式
- `tests/*`: 单元测试
- `doc/design.md`: 设计文档
- `doc/aiUsageRecords.md`: ai使用记录
- `commit-log.txt`: 提交记录


## 功能说明

- 表格操作：新增行、删除行、编辑单元格
- 校验：Name非空且不重名、DataType为BOOL/INT、DefaultValue类型校验需要与DateType匹配，大小写不敏感校验
- 导入：解析 `VAR...END_VAR` 文本，失败时提示错误且不写入
- 导出：按标准格式生成文本，自动省略空默认值和空注释