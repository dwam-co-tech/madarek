'use client';

import React from 'react';
import styles from './SearchFilter.module.css';
import Dropdown from '@/components/Dropdown';

export type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'boolean';
  options?: { label: string; value: string }[];
};

export type SearchQuery = {
  text?: string;
  fields?: string[];
  date?: { field: string; from?: string; to?: string };
  filters?: Record<string, unknown>;
  sort?: { key: string; dir: 'asc' | 'desc' };
};

type Props = {
  fields: FieldDef[];
  onChange: (q: SearchQuery) => void;
  defaultSelectedFields?: string[];
  showFieldPicker?: boolean;
  totalCount?: number;
  filteredCount?: number;
};

function isDateField(f: FieldDef) {
  return f.type === 'date';
}
function isSearchableField(f: FieldDef) {
  return f.type === 'text' || f.type === 'number';
}

export default function SearchFilter({
  fields,
  onChange,
  defaultSelectedFields,
  totalCount,
  filteredCount,
}: Props) {
  const dateFields = React.useMemo(() => fields.filter(isDateField), [fields]);
  const searchableFields = React.useMemo(() => fields.filter(isSearchableField), [fields]);

  const [text, setText] = React.useState('');
  const selectedFields = React.useMemo<string[]>(
    () =>
      defaultSelectedFields && defaultSelectedFields.length
        ? defaultSelectedFields
        : searchableFields.map((f) => f.key),
    [defaultSelectedFields, searchableFields]
  );

  const [order, setOrder] = React.useState<'latest' | 'oldest'>('latest');
  const hasPublished = React.useMemo(
    () => fields.some((f) => f.key === 'published' && f.type === 'boolean'),
    [fields]
  );
  const [pubFilter, setPubFilter] = React.useState<'any' | 'true' | 'false'>('any');

  React.useEffect(() => {
    const sortField =
      dateFields[0]?.key ??
      searchableFields[0]?.key ??
      fields[0]?.key ??
      '';
    const sortDir: 'asc' | 'desc' = order === 'latest' ? 'desc' : 'asc';
    const q: SearchQuery = {
      text: text.trim() || undefined,
      fields: selectedFields.length ? selectedFields : undefined,
      sort: sortField ? { key: sortField, dir: sortDir } : undefined,
      filters: hasPublished
        ? { published: pubFilter }
        : undefined,
    };
    onChange(q);
  }, [text, selectedFields, dateFields, searchableFields, fields, order, hasPublished, pubFilter, onChange]);

  return (
    <div className={styles.bar}>
      <div className={styles.group} style={{ minWidth: 240 }}>
        <div className={styles.label}>بحث</div>
        <input
          className={styles.input}
          placeholder="ابحث بالاسم أو البريد أو العنوان..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className={styles.group}>
        <div className={styles.label}>فرز</div>
        <Dropdown
          options={[
            { value: 'latest', label: 'الأحدث' },
            { value: 'oldest', label: 'الأقدم' },
          ]}
          value={order}
          onChange={(v) => setOrder(v as 'latest' | 'oldest')}
          ariaLabel="فرز النتائج"
        />
      </div>

      {hasPublished && (
        <div className={styles.group}>
          <div className={styles.label}>الحالة</div>
          <Dropdown
            options={[
              { value: 'any', label: 'أي حالة' },
              { value: 'true', label: 'منشور' },
              { value: 'false', label: 'مسودة' },
            ]}
            value={pubFilter}
            onChange={(v) => setPubFilter(v as 'any' | 'true' | 'false')}
            ariaLabel="تصفية بالحالة"
          />
        </div>
      )}

    </div>
  );
}
