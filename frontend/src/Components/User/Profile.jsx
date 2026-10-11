import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getToken } from '../../Utils/helpers';
import './Profile.css';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  const getProfile = async () => {
    let token = getToken();
    try {
      const raw = sessionStorage.getItem('token');
      if (raw) token = JSON.parse(raw);
    } catch (e) {}

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };

    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config);
      setUser(data.user);
      if (typeof window !== 'undefined' && data.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to retrieve profile information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }).toUpperCase();
    } catch (e) {
      return String(dateStr).substring(0, 10);
    }
  };

  const avatarUrl =
    user?.avatar?.url ||
    'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png';

  const addressCount = user?.addresses ? user.addresses.length : 0;

  return (
    <div className="ds-profile-page">
      <MetaData title="Rider Profile — Dosnoventa" />

      {loading ? (
        <Loader />
      ) : (
        <>
          <section className="ds-profile-header">
            <div className="ds-container-wide">
              <span className="editorial-label">SYNDICATE DOSSIER</span>
              <h1 className="ds-profile-title">RIDER PROFILE</h1>
            </div>
          </section>

          <main className="ds-profile-main">
            <div className="ds-container-wide ds-profile-grid">
              {/* Left Column: Avatar & Quick Actions */}
              <div className="ds-profile-avatar-column">
                <div className="ds-profile-avatar-box">
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="ds-profile-avatar-img"
                  />
                  <div className="ds-profile-role-tag">
                    {user.role === 'admin' ? 'ATELIER ADMIN' : 'REGISTERED RIDER'}
                  </div>
                </div>

                <div className="ds-profile-sidebar-links">
                  <Link to="/me/update" className="ds-btn ds-sidebar-btn">
                    EDIT PROFILE DETAILS →
                  </Link>
                  <Link to="/me/addresses" className="ds-btn ds-btn-outline ds-sidebar-btn">
                    MANAGE SAVED ADDRESSES ({addressCount})
                  </Link>
                  {user.role !== 'admin' && (
                    <Link to="/orders/me" className="ds-btn ds-btn-outline ds-sidebar-btn">
                      ORDER HISTORY
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="ds-btn ds-btn-outline ds-sidebar-btn">
                      ADMINISTRATOR PANEL
                    </Link>
                  )}
                  <Link to="/password/update" className="ds-btn ds-btn-outline ds-sidebar-btn">
                    CHANGE PASSWORD
                  </Link>
                </div>
              </div>

              {/* Right Column: Account Specifications & Dossier */}
              <div className="ds-profile-info-column">
                <div className="ds-profile-dossier-card">
                  <h3 className="ds-dossier-heading">ACCOUNT SPECIFICATIONS</h3>

                  <div className="ds-dossier-rows">
                    <div className="ds-dossier-row">
                      <span className="ds-dossier-label">FULL NAME</span>
                      <strong className="ds-dossier-value">{user.name}</strong>
                    </div>

                    <div className="ds-dossier-row">
                      <span className="ds-dossier-label">EMAIL ADDRESS</span>
                      <strong className="ds-dossier-value">{user.email}</strong>
                    </div>

                    <div className="ds-dossier-row">
                      <span className="ds-dossier-label">MEMBER SINCE</span>
                      <strong className="ds-dossier-value">{formatDate(user.createdAt)}</strong>
                    </div>

                    <div className="ds-dossier-row">
                      <span className="ds-dossier-label">SAVED DISPATCH LOCATIONS</span>
                      <strong className="ds-dossier-value">
                        {addressCount} {addressCount === 1 ? 'ADDRESS' : 'ADDRESSES'}
                      </strong>
                    </div>

                    <div className="ds-dossier-row">
                      <span className="ds-dossier-label">ACCOUNT STATUS</span>
                      <span className="ds-dossier-status-active">● ACTIVE SYNDICATE MEMBER</span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Preview Summary */}
                <div className="ds-profile-dispatch-card">
                  <div className="ds-dispatch-card-top">
                    <span className="editorial-label">PRIMARY DISPATCH DESTINATION</span>
                    <Link to="/me/addresses" className="ds-manage-link">
                      MANAGE ALL ({addressCount}) ↗
                    </Link>
                  </div>

                  {user.addresses && user.addresses.length > 0 ? (
                    (() => {
                      const defaultAddr =
                        user.addresses.find((a) => a.isDefault) || user.addresses[0];
                      return (
                        <div className="ds-preview-addr-content">
                          <span className="ds-preview-addr-label">{defaultAddr.label || 'Home'}</span>
                          <strong className="ds-preview-recipient">{defaultAddr.recipientName}</strong>
                          <p className="ds-preview-lines">
                            {defaultAddr.addressLine1}
                            {defaultAddr.addressLine2 ? `, ${defaultAddr.addressLine2}` : ''}
                            <br />
                            {defaultAddr.city}, {defaultAddr.postalCode} — {defaultAddr.country}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="ds-no-address-preview">
                      <p>No delivery address saved to your account yet.</p>
                      <Link to="/me/addresses" className="ds-btn ds-btn-sm ds-btn-outline">
                        + ADD SAVED ADDRESS
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default Profile;