import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './SideBar';
import { getAdminConfig } from '../../Utils/helpers';
import axios from 'axios';
import ProductSalesChart from './ProductSalesChart';
import UserSalesChart from './UserSalesChart';
import MonthlySalesChart from './MonthlySalesChart';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const config = getAdminConfig();

            // Fetch products, orders, and users concurrently
            const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
                axios.get(`${import.meta.env.VITE_API}/admin/products`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/orders`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/users`, config),
            ]);

            const prods = productsRes.status === 'fulfilled' ? (productsRes.value.data.products || []) : [];
            const ords = ordersRes.status === 'fulfilled' ? (ordersRes.value.data.orders || []) : [];
            const usrs = usersRes.status === 'fulfilled' ? (usersRes.value.data.users || []) : [];

            setProducts(prods);
            setOrders(ords);
            setUsers(usrs);

            // Compute total sales from non-cancelled orders
            const revenue = ords.reduce((acc, order) => {
                return order.orderStatus !== 'Cancelled' ? acc + (Number(order.totalPrice) || 0) : acc;
            }, 0);
            setTotalAmount(revenue);

            setLoading(false);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const outOfStockCount = products.filter(p => Number(p.stock) === 0).length;

    return (
        <>
            <MetaData title={'Admin Dashboard — DOSNOVENTA'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <div className="d-flex justify-content-between align-items-center my-4 pr-4">
                        <h1 className="text-uppercase tracking-wider font-weight-bold mb-0">Atelier Operations Dashboard</h1>
                        <span className="badge badge-dark p-2 text-uppercase">Live Database Feed</span>
                    </div>

                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {/* Total Gross Revenue Card */}
                            <div className="row pr-4 mb-4">
                                <div className="col-12">
                                    <div className="card text-white bg-dark border-secondary shadow-sm">
                                        <div className="card-body py-4 text-center">
                                            <div className="text-muted text-uppercase tracking-widest small mb-1">
                                                Verified Gross Sales (Active Orders)
                                            </div>
                                            <h2 className="display-4 font-weight-bold text-light mb-0">
                                                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stat Badges Grid */}
                            <div className="row pr-4">
                                {/* Products */}
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white bg-dark border-secondary h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="text-muted text-uppercase small">Catalog Items</div>
                                            <div className="h3 font-weight-bold mt-2">{products.length}</div>
                                        </div>
                                        <Link className="card-footer text-muted border-secondary clearfix small" to="/admin/products">
                                            <span className="float-left">Manage Products</span>
                                            <span className="float-right"><i className="fa fa-angle-right"></i></span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Orders */}
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white bg-dark border-secondary h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="text-muted text-uppercase small">Orders Processed</div>
                                            <div className="h3 font-weight-bold mt-2">{orders.length}</div>
                                        </div>
                                        <Link className="card-footer text-muted border-secondary clearfix small" to="/admin/orders">
                                            <span className="float-left">Manage Orders</span>
                                            <span className="float-right"><i className="fa fa-angle-right"></i></span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Users */}
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white bg-dark border-secondary h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="text-muted text-uppercase small">Registered Riders</div>
                                            <div className="h3 font-weight-bold mt-2">{users.length}</div>
                                        </div>
                                        <Link className="card-footer text-muted border-secondary clearfix small" to="/admin/users">
                                            <span className="float-left">Manage Riders</span>
                                            <span className="float-right"><i className="fa fa-angle-right"></i></span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Out of Stock */}
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white bg-dark border-secondary h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="text-muted text-uppercase small">Out of Stock Items</div>
                                            <div className={`h3 font-weight-bold mt-2 ${outOfStockCount > 0 ? 'text-warning' : 'text-success'}`}>
                                                {outOfStockCount}
                                            </div>
                                        </div>
                                        <Link className="card-footer text-muted border-secondary clearfix small" to="/admin/products">
                                            <span className="float-left">Audit Inventory</span>
                                            <span className="float-right"><i className="fa fa-angle-right"></i></span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Visualizations Section */}
                            <div className="pr-4 mt-5">
                                <h3 className="text-uppercase tracking-wider small text-muted font-weight-bold mb-4">
                                    Analytics & Revenue Intelligence
                                </h3>
                                
                                <div className="card bg-dark border-secondary p-4 mb-4">
                                    <h5 className="text-uppercase text-light small mb-3">Revenue By Frame & Component Line</h5>
                                    <ProductSalesChart />
                                </div>

                                <div className="card bg-dark border-secondary p-4 mb-4">
                                    <h5 className="text-uppercase text-light small mb-3">Top Atelier Customers</h5>
                                    <UserSalesChart />
                                </div>

                                <div className="card bg-dark border-secondary p-4 mb-4">
                                    <h5 className="text-uppercase text-light small mb-3">Monthly Dispatch Trajectory</h5>
                                    <MonthlySalesChart />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;