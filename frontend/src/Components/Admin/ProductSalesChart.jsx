import React, { useState, useEffect } from 'react';
import { getAdminConfig } from "../../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const pieColors = [
        "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6",
        "#E6B333", "#3366E6", "#999966", "#809980", "#E6FF80",
        "#1AFF33", "#999933", "#FF3380", "#CCCC00", "#66E64D",
        "#4D80CC", "#FF4D4D", "#99E6E6", "#6666FF"
    ];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${percent}%`}
            </text>
        );
    };

    const productSales = async () => {
        try {
            const config = getAdminConfig();
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/product-sales`, config);
            setSales(data.totalPercentage || []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        productSales();
    }, []);

    if (loading) return <Loader />;
    if (sales.length === 0) return <p className="text-muted p-4">No product sales recorded yet.</p>;

    return (
        <ResponsiveContainer width="90%" height={600}>
            <PieChart width={600} height={600}>
                <Pie
                    dataKey="percent"
                    nameKey="name"
                    isAnimationActive={true}
                    data={sales}
                    cx="50%"
                    cy="50%"
                    outerRadius={200}
                    fill="#8884d8"
                    label={renderCustomizedLabel}
                    labelLine={false}
                >
                    {sales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="top" align="right" />
            </PieChart>
        </ResponsiveContainer>
    );
}