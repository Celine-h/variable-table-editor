import type { DataType, VariableItem } from '@/types/variable';
import { defaultValueByType, normalizeBoolValue, validateDefaultValue } from './validators';

export interface ParseSuccess {
  ok: true;
  rows: VariableItem[];
}

export interface ParseFailure {
  ok: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

interface ParseLineSuccess {
  ok: true;
  row: Omit<VariableItem, 'id'>;
}

function parseLine(line: string, lineNo: number): ParseLineSuccess | ParseFailure {
  const linePattern =
    /^([A-Za-z_]\w*)\s*:\s*([A-Za-z]+)\s*(?::=\s*([^;]+))?\s*;\s*(?:\/\/\s*(.*))?$/;
  const match = line.match(linePattern);
  if (!match) {
    return { ok: false, error: `Format error at line ${lineNo}, cannot parse` };
  }

  const [, name, rawType, rawDefault, comment = ''] = match;
  const dataType = rawType.toUpperCase() as DataType;
  if (dataType !== 'BOOL' && dataType !== 'INT') {
    return { ok: false, error: `Unsupported data type: ${rawType}` };
  }

  let defaultValue = rawDefault?.trim() ?? '';
  if (!defaultValue) {
    defaultValue = defaultValueByType(dataType);
  }

  if (dataType === 'BOOL') {
    const normalized = normalizeBoolValue(defaultValue);
    if (!normalized) {
      return { ok: false, error: `Invalid BOOL default value at line ${lineNo}` };
    }
    defaultValue = normalized;
  }

  if (dataType === 'INT') {
    const err = validateDefaultValue(dataType, defaultValue);
    if (err) {
      return { ok: false, error: `${err} at line ${lineNo}` };
    }
    defaultValue = String(Number(defaultValue.trim()));
  }

  return {
    ok: true,
    row: {
      name,
      dataType,
      defaultValue,
      comment: comment.trim(),
    },
  };
}

export function parseVarText(input: string): ParseResult {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2 || lines[0].toUpperCase() !== 'VAR' || lines[lines.length - 1].toUpperCase() !== 'END_VAR') {
    return { ok: false, error: 'Format error, must start with VAR and end with END_VAR' };
  }

  const content = lines.slice(1, -1);
  const rows: VariableItem[] = [];

  for (let i = 0; i < content.length; i += 1) {
    const parsed = parseLine(content[i], i + 2);
    if (!parsed.ok) {
      return parsed;
    }

    rows.push({
      id: `import-${i + 1}`,
      ...parsed.row,
    });
  }

  return { ok: true, rows };
}

export function exportVarText(rows: VariableItem[]): string {
  const lines = rows.map((row) => {
    const parts: string[] = [];
    parts.push(`${row.name} : ${row.dataType}`);

    if (row.defaultValue.trim()) {
      parts.push(`:= ${row.defaultValue.trim()}`);
    }

    let line = `${parts.join(' ')};`;
    if (row.comment.trim()) {
      line += ` // ${row.comment.trim()}`;
    }
    return line;
  });

  return ['VAR', ...lines, 'END_VAR'].join('\n');
}
