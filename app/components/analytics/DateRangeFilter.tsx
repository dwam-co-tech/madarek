'use client';

import React, { useState } from 'react';
import styles from './analytics.module.css';

interface DateRangeFilterProps {
    onFilterChange: (from: string | null, to: string | null) => void;
    loading: boolean;
}

export default function DateRangeFilter({ onFilterChange, loading }: DateRangeFilterProps) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [error, setError] = useState('');

    const handleApply = () => {
        // Validate date range
        if (from && to && from > to) {
            setError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
            return;
        }

        setError('');
        onFilterChange(from || null, to || null);
    };

    const handleReset = () => {
        setFrom('');
        setTo('');
        setError('');
        onFilterChange(null, null);
    };

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterInputs}>
                <div className={styles.filterGroup}>
                    <label htmlFor="from-date" className={styles.filterLabel}>
                        من تاريخ
                    </label>
                    <input
                        id="from-date"
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        disabled={loading}
                        className={styles.dateInput}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="to-date" className={styles.filterLabel}>
                        إلى تاريخ
                    </label>
                    <input
                        id="to-date"
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        disabled={loading}
                        className={styles.dateInput}
                    />
                </div>

                <button
                    onClick={handleApply}
                    disabled={loading}
                    className={styles.applyButton}
                >
                    تطبيق
                </button>

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className={styles.resetButton}
                >
                    إعادة تعيين
                </button>
            </div>

            {error && (
                <div className={styles.filterError}>
                    {error}
                </div>
            )}
        </div>
    );
}
