'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getCountryStatistics } from '@/app/lib/analytics.service';
import type { CountryStatisticsResponse } from '@/app/lib/analytics.model';
import CountryChart from './CountryChart';
import CountryTable from './CountryTable';
import styles from './analytics.module.css';

export default function CountryAnalyticsSection() {
    const [data, setData] = useState<CountryStatisticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching country statistics...');
            const result = await getCountryStatistics();
            console.log('Country statistics result:', result);
            setData(result);
        } catch (err) {
            console.error('Error fetching country statistics:', err);
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchData();
    };

    return (
        <section className={styles.analyticsSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>إحصائيات الدول</h2>
                <button
                    onClick={handleRefresh}
                    className={styles.refreshButton}
                    disabled={loading}
                    aria-label="تحديث البيانات"
                >
                    <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                </button>
            </div>

            {loading && !data && (
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>جاري تحميل البيانات...</p>
                </div>
            )}

            {error && (
                <div className={styles.errorMessage}>
                    <p>{error}</p>
                    <button onClick={handleRefresh} className={styles.retryButton}>
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {!loading && !error && data && (
                <div className={styles.countryGrid}>
                    <div className={styles.chartContainer}>
                        <CountryChart data={data.countries} />
                    </div>
                    <div className={styles.tableContainer}>
                        <CountryTable data={data.countries} />
                    </div>
                </div>
            )}
        </section>
    );
}
