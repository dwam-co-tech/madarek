'use client';

import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import type { DailyVisit } from '@/app/lib/analytics.model';

interface DailyVisitsChartProps {
    data: DailyVisit[];
}

export default function DailyVisitsChart({ data }: DailyVisitsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                لا توجد بيانات لعرضها
            </div>
        );
    }

    // Reverse data to show oldest to newest (left to right)
    const chartData = [...data].reverse().map((item) => ({
        ...item,
        formattedDate: formatDate(item.date),
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B4513" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B4513" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
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
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                                        {data.formattedDate}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0' }}>
                                        الزيارات: {data.visits.toLocaleString('ar-EG')}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#8B4513"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisits)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
