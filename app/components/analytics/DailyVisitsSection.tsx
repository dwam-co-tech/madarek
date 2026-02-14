'use client';

import React, { useEffect, useState } from 'react';
import { getDailyVisits } from '@/app/lib/analytics.service';
import type { DailyVisitsResponse } from '@/app/lib/analytics.model';
import DateRangeFilter from './DateRangeFilter';
import DailyVisitsChart from './DailyVisitsChart';
import DailyVisitsTable from './DailyVisitsTable';
import styles from './analytics.module.css';

export default function DailyVisitsSection() {
    const [data, setData] = useState<DailyVisitsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ from: string | null; to: string | null }>({
        from: null,
        to: null,
    });

    const fetchData = async (from: string | null, to: string | null) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching daily visits...', { from, to });
            const result = await getDailyVisits(from || undefined, to || undefined);
            console.log('Daily visits result:', result);
            setData(result);
        } catch (err) {
            console.error('Error fetching daily visits:', err);
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(dateRange.from, dateRange.to);
    }, [dateRange]);

    const handleFilterChange = (from: string | null, to: string | null) => {
        setDateRange({ from, to });
    };

    const handleRetry = () => {
        fetchData(dateRange.from, dateRange.to);
    };

    return (
        <section className={styles.analyticsSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>إحصائيات الزيارات اليومية</h2>
            </div>

            <DateRangeFilter onFilterChange={handleFilterChange} loading={loading} />

            {loading && !data && (
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>جاري تحميل البيانات...</p>
                </div>
            )}

            {error && (
                <div className={styles.errorMessage}>
                    <p>{error}</p>
                    <button onClick={handleRetry} className={styles.retryButton}>
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {!loading && !error && data && (
                <div className={styles.dailyVisitsContainer}>
                    <div className={styles.chartWrapper}>
                        <DailyVisitsChart data={data.daily_visits} />
                    </div>
                    <div className={styles.tableWrapper}>
                        <DailyVisitsTable data={data.daily_visits} />
                    </div>
                </div>
            )}
        </section>
    );
}
