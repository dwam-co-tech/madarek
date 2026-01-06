'use client';

import React from 'react';
import styles from './LoadingOverlay.module.css';

type Props = {
  open: boolean;
  label?: string;
  ariaLabel?: string;
};

export default function LoadingOverlay({ open, label = 'جاري التحميل...', ariaLabel = 'جاري التحميل' }: Props) {
  if (!open) return null;
  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label={ariaLabel}>
      <div className={styles.box}>
        <div className={styles.spinner} />
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
}
