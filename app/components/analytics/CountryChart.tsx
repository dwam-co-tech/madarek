'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CountryStatistic } from '@/app/lib/analytics.model';

interface CountryChartProps {
    data: CountryStatistic[];
}

const COLORS = [
    '#8B4513', // Brown
    '#D2691E', // Chocolate
    '#CD853F', // Peru
    '#DEB887', // BurlyWood
    '#F4A460', // SandyBrown
    '#DAA520', // GoldenRod
    '#B8860B', // DarkGoldenRod
    '#BC8F8F', // RosyBrown
    '#A0522D', // Sienna
    '#8B7355', // BurlyWood4
];

export default function CountryChart({ data }: CountryChartProps) {
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                لا توجد بيانات لعرضها
            </div>
        );
    }

    // Show top 10 countries individually, group rest as "Other"
    const top10 = data.slice(0, 10);
    const rest = data.slice(10);

    const chartData = top10.map(country => ({
        name: country.country_name,
        value: country.visits,
        percentage: country.percentage,
        country_code: country.country_code,
    }));

    if (rest.length > 0) {
        const otherVisits = rest.reduce((sum, country) => sum + country.visits, 0);
        const otherPercentage = rest.reduce((sum, country) => sum + country.percentage, 0);
        chartData.push({
            name: 'دول أخرى',
            value: otherVisits,
            percentage: otherPercentage,
            country_code: 'OTHER',
        });
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.payload?.percentage?.toFixed(1) || '0.0'}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        direction: 'rtl',
                                    }}
                                >
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
                                    <p style={{ margin: '5px 0 0 0' }}>
                                        الزيارات: {data.value.toLocaleString('ar-EG')}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0' }}>
                                        النسبة: {data.percentage.toFixed(1)}%
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (entry as any)?.payload?.name || value}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
