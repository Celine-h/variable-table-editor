import type { DataType, VariableItem } from '@/types/variable';

const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

export function defaultValueByType(dataType: DataType): string {
  return dataType === 'BOOL' ? 'TRUE' : '0';
}

export function normalizeBoolValue(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'TRUE' || normalized === 'FALSE') {
    return normalized;
  }
  return null;
}

export function validateName(
  name: string,
  rows: VariableItem[],
  currentId: string,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Name cannot be empty';
  }

  const lower = trimmed.toLowerCase();
  const duplicated = rows.some(
    (row) => row.id !== currentId && row.name.trim().toLowerCase() === lower,
  );
  if (duplicated) {
    return 'Name already exists';
  }
  return null;
}

export function validateDefaultValue(dataType: DataType | '', value: string): string | null {
  if (!dataType) {
    return null;
  }

  if (dataType === 'BOOL') {
    return normalizeBoolValue(value) ? null : 'BOOL default value must be TRUE or FALSE';
  }

  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    return 'INT default value must be an integer';
  }

  const intValue = Number(trimmed);
  if (intValue < INT_MIN || intValue > INT_MAX) {
    return 'INT default value is out of range';
  }

  return null;
}
