'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DailyVisit } from '@/app/lib/analytics.model';
import styles from './analytics.module.css';

interface DailyVisitsTableProps {
    data: DailyVisit[];
}

export default function DailyVisitsTable({ data }: DailyVisitsTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyState}>
                لا توجد بيانات لعرضها
            </div>
        );
    }

    const totalVisits = data.reduce((sum, day) => sum + day.visits, 0);

    // Calculate change from previous day
    const dataWithChange = data.map((day, index) => {
        const previousDay = data[index + 1];
        let change = 0;
        let changeType: 'up' | 'down' | 'neutral' = 'neutral';

        if (previousDay) {
            change = day.visits - previousDay.visits;
            if (change > 0) changeType = 'up';
            else if (change < 0) changeType = 'down';
        }

        return { ...day, change, changeType };
    });

    return (
        <div className={styles.tableContainer}>
            <table className={styles.statsTable}>
                <thead>
                    <tr className={styles.tableHeader}>
                        <th>التاريخ</th>
                        <th>الزيارات</th>
                        <th>التغيير</th>
                    </tr>
                </thead>
                <tbody>
                    {dataWithChange.map((day) => {
                        const date = new Date(day.date);
                        const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Friday or Saturday

                        return (
                            <tr
                                key={day.date}
                                className={`${styles.tableRow} ${isWeekend ? styles.weekendRow : ''}`}
                            >
                                <td className={styles.tableCell}>
                                    {formatDate(day.date)}
                                </td>
                                <td className={styles.tableCell}>
                                    {day.visits.toLocaleString('ar-EG')}
                                </td>
                                <td className={styles.tableCell}>
                                    {day.changeType === 'up' && (
                                        <span className={styles.trendUp}>
                                            <TrendingUp size={16} />
                                            {Math.abs(day.change).toLocaleString('ar-EG')}+
                                        </span>
                                    )}
                                    {day.changeType === 'down' && (
                                        <span className={styles.trendDown}>
                                            <TrendingDown size={16} />
                                            {Math.abs(day.change).toLocaleString('ar-EG')}-
                                        </span>
                                    )}
                                    {day.changeType === 'neutral' && (
                                        <span className={styles.trendNeutral}>
                                            <Minus size={16} />
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className={styles.tableFoot}>
                        <td className={styles.tableCell}>الإجمالي</td>
                        <td className={styles.tableCell}>
                            {totalVisits.toLocaleString('ar-EG')}
                        </td>
                        <td className={styles.tableCell}>-</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
