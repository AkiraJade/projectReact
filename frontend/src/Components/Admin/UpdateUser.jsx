import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { errMsg, successMsg, getToken } from '../../Utils/helpers';

import axios from 'axios';

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState(true)
    const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    const { id } = useParams();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    }
    const getUserDetails = async (id) => {

        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/user/${id}`, config)
            setUser(data.user)
            setLoading(false)

        } catch (error) {
            setError(error.response.data.message)
        }
    }

    const updateUser = async (id, userData) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}`, userData, config)
            setIsUpdated(data.success)
            setLoading(false)

        } catch (error) {
            setError(error.response.data.message)
        }
    }

    useEffect(() => {
        // console.log(user && user._id !== userId);
        if (user && user._id !== id) {
            getUserDetails(id)
        } else {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role)
        }
        if (error) {
            errMsg(error);
            setError('');
        }
        if (isUpdated) {
            successMsg('User updated successfully')
            navigate('/admin/users')

        }
    }, [error, isUpdated, id, user])
    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('role', role);
        updateUser(user._id, formData)
    }

    return (
        <div className="ds-admin-form-card" style={{ maxWidth: 600, margin: '0 auto' }}>
            <MetaData title={`Update Rider — DOSNOVENTA`} />
            <div>
                <form onSubmit={submitHandler}>
                    <h2 className="ds-form-section-title">Update Rider Account</h2>
                    <div className="ds-form-group">
                        <label htmlFor="name_field" className="ds-form-label">Full Name</label>
                        <input
                            type="text"
                            id="name_field"
                            className="ds-form-input"
                            name='name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="ds-form-group">
                        <label htmlFor="email_field" className="ds-form-label">Email Address</label>
                        <input
                            type="email"
                            id="email_field"
                            className="ds-form-input"
                            name='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="ds-form-group">
                        <label htmlFor="role_field" className="ds-form-label">Account Role</label>
                        <select
                            id="role_field"
                            className="ds-form-select"
                            name='role'
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User (Customer)</option>
                            <option value="admin">Admin (Atelier Staff)</option>
                        </select>
                    </div>
                    <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            className="ds-admin-btn-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="ds-btn-primary">
                            Update Rider
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateUser