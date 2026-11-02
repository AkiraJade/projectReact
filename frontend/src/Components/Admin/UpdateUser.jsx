import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../../Utils/helpers';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';

const UpdateUser = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    const getUserDetails = async (userId) => {
        try {
            const token = getToken();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/user/${userId}`, config);
            const fetched = data.user || {};
            setUser(fetched);
            setName(fetched.name || '');
            setEmail(fetched.email || '');
            setRole(fetched.role || 'user');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error fetching user dossier', { position: 'bottom-right' });
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userId, userData) => {
        setUpdating(true);
        try {
            const token = getToken();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            };
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/user/${userId}`, userData, config);
            if (data.success) {
                toast.success('Rider details updated successfully', { position: 'bottom-right' });
                navigate('/admin/users');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update user', { position: 'bottom-right' });
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        getUserDetails(id);
    }, [id]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty', { position: 'bottom-right' });
            return;
        }
        if (!email.trim()) {
            toast.error('Email cannot be empty', { position: 'bottom-right' });
            return;
        }
        updateUser(id, { name: name.trim(), email: email.trim(), role });
    };

    if (loading) return <Loader />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <MetaData title={`Update Rider — DOSNOVENTA`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            color: '#374151',
                            borderColor: '#D1D5DB',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '6px'
                        }}
                    >
                        Riders
                    </Button>
                </Link>
                <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111827' }}>
                    Modify Rider Account
                </h1>
            </div>

            <div className="ds-card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <form onSubmit={submitHandler}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="name_field" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name_field"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="email_field" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email_field"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label htmlFor="role_field" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                            Platform Role
                        </label>
                        <select
                            id="role_field"
                            className="form-control"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User / Rider (Customer)</option>
                            <option value="admin">Administrator (Atelier Staff)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-block py-3"
                        disabled={updating}
                        style={{
                            background: '#111827',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            borderRadius: '6px'
                        }}
                    >
                        {updating ? 'Saving Changes...' : 'Save Rider Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateUser;
