import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/tracker';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const AnalyticsPanel = () => {
    const [data, setData] = useState(getAnalytics());
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const analytics = getAnalytics();
        setData(analytics);

        // Generate last 7 days data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            const key = format(d, 'yyyy-MM-dd');
            return {
                name: format(d, 'EEE'), // Mon, Tue...
                minutes: analytics.dailyLogs[key] || 0
            };
        });
        setChartData(last7Days);
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #2a2a35, #1a1a1e)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            marginBottom: '32px'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>Your Learning Stats</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#a1a1aa' }}>Total Watch Time</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#646cff' }}>
                        {Math.floor(data.totalMinutes / 60)}h {data.totalMinutes % 60}m
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#a1a1aa' }}>Today</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4cc9f0' }}>
                        {data.dailyLogs[format(new Date(), 'yyyy-MM-dd')] || 0}m
                    </div>
                </div>
            </div>

            <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="minutes" fill="#646cff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
