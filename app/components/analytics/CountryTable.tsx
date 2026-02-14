'use client';

import React from 'react';
import type { CountryStatistic } from '@/app/lib/analytics.model';
import styles from './analytics.module.css';

interface CountryTableProps {
    data: CountryStatistic[];
}

export default function CountryTable({ data }: CountryTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyState}>
                لا توجد بيانات لعرضها
            </div>
        );
    }

    const totalVisits = data.reduce((sum, country) => sum + country.visits, 0);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.statsTable}>
                <thead>
                    <tr className={styles.tableHeader}>
                        <th>الدولة</th>
                        <th>الزيارات</th>
                        <th>النسبة</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((country, index) => (
                        <tr
                            key={country.country_code}
                            className={`${styles.tableRow} ${index < 3 ? styles.highlightRow : ''}`}
                        >
                            <td className={styles.tableCell}>{country.country_name}</td>
                            <td className={styles.tableCell}>
                                {country.visits.toLocaleString('ar-EG')}
                            </td>
                            <td className={styles.tableCell}>
                                {country.percentage.toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className={styles.tableFoot}>
                        <td className={styles.tableCell}>الإجمالي</td>
                        <td className={styles.tableCell}>
                            {totalVisits.toLocaleString('ar-EG')}
                        </td>
                        <td className={styles.tableCell}>100%</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
