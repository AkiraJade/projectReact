import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminConfig } from "../../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';

export default function MonthlySalesChart() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const monthlySales = async () => {
        try {
            const config = getAdminConfig();
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config);
            setSales(data.salesPerMonth || []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        monthlySales();
    }, []);

    if (loading) return <Loader />;
    if (sales.length === 0) return <p className="text-muted p-4">No monthly sales recorded yet.</p>;

    return (
        <ResponsiveContainer width="90%" height={450}>
            <LineChart width={600} height={300} data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#ff3b30" strokeWidth={2} />
                <CartesianGrid stroke="#333" strokeDasharray="5 5" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}