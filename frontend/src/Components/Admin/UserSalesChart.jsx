import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { getAdminConfig } from "../../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';

const UserSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const userSales = async () => {
        try {
            const config = getAdminConfig();
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/customer-sales`, config);
            setSales(data.customerSales || []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const barColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];

    useEffect(() => {
        userSales();
    }, []);

    if (loading) return <Loader />;
    if (sales.length === 0) return <p className="text-muted p-4">No customer sales records available.</p>;

    return (
        <ResponsiveContainer width="90%" height={450}>
            <BarChart data={sales}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" stroke="#000000" strokeWidth={1}>
                    {sales.map((item, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default UserSalesChart;