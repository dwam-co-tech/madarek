'use client';

import React from 'react';
import styles from './Dropdown.module.css';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  ariaLabel,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const selectedIndex = React.useMemo(
    () => Math.max(0, options.findIndex((o) => o.value === value)),
    [options, value]
  );
  const selectedLabel = options[selectedIndex]?.label ?? placeholder ?? '';

  React.useEffect(() => {
    setHighlighted(selectedIndex);
  }, [selectedIndex]);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[highlighted];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={[styles.wrapper, disabled ? styles.disabled : '', className ?? ''].join(' ').trim()}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? 'فتح القائمة'}
        disabled={disabled}
      >
        <span className={styles.buttonLabel}>{selectedLabel || 'اختر'}</span>
        <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={styles.dropdown} role="listbox">
          {options.map((opt, i) => {
            const isSelected = value === opt.value;
            const isActive = highlighted === i;
            return (
              <button
                key={opt.value}
                type="button"
                className={[
                  styles.item,
                  isSelected ? styles.itemSelected : '',
                  isActive ? styles.itemActive : '',
                ].join(' ').trim()}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className={styles.itemLabel}>{opt.label}</span>
                {isSelected && (
                  <svg className={styles.check} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

