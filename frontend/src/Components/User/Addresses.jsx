import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { countries } from 'countries-list';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getToken } from '../../Utils/helpers';
import './Addresses.css';

const COUNTRIES_LIST = Object.values(countries).map((c) => c.name).sort();

const initialAddressState = {
  label: 'Home',
  recipientName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Spain',
  isDefault: false,
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialAddressState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeader = () => {
    let token = getToken();
    try {
      const raw = sessionStorage.getItem('token');
      if (raw) token = JSON.parse(raw);
    } catch (e) {}
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/me/addresses`,
        getAuthHeader()
      );
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error loading saved addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      ...initialAddressState,
      isDefault: addresses.length === 0,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingId(addr._id);
    setFormData({
      label: addr.label || 'Home',
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      province: addr.province || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Spain',
      isDefault: !!addr.isDefault,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(initialAddressState);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.recipientName.trim()) errs.recipientName = 'RECIPIENT NAME IS REQUIRED';
    if (!formData.phone.trim()) errs.phone = 'CONTACT PHONE IS REQUIRED';
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'ADDRESS LINE 1 IS REQUIRED';
    if (!formData.city.trim()) errs.city = 'CITY IS REQUIRED';
    if (!formData.postalCode.trim()) errs.postalCode = 'POSTAL CODE IS REQUIRED';
    if (!formData.country.trim()) errs.country = 'COUNTRY IS REQUIRED';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing address
        const { data } = await axios.put(
          `${import.meta.env.VITE_API}/me/addresses/${editingId}`,
          formData,
          getAuthHeader()
        );
        if (data.success) {
          toast.success('Address updated successfully');
          setAddresses(data.addresses);
          handleCloseModal();
        }
      } else {
        // Add new address
        const { data } = await axios.post(
          `${import.meta.env.VITE_API}/me/addresses`,
          formData,
          getAuthHeader()
        );
        if (data.success) {
          toast.success('Address added successfully');
          setAddresses(data.addresses);
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_API}/me/addresses/${id}`,
        getAuthHeader()
      );
      if (data.success) {
        toast.success('Address deleted successfully');
        setAddresses(data.addresses);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API}/me/addresses/${id}/default`,
        {},
        getAuthHeader()
      );
      if (data.success) {
        toast.success('Default address updated');
        setAddresses(data.addresses);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div className="ds-addresses-page">
      <MetaData title="Saved Delivery Addresses — Dosnoventa" />

      <section className="ds-addresses-header">
        <div className="ds-container-wide">
          <div className="ds-addresses-header-inner">
            <div>
              <span className="editorial-label">ACCOUNT DISPATCH NETWORK</span>
              <h1 className="ds-addresses-title">SAVED ADDRESSES</h1>
              <p className="ds-addresses-subtitle">
                Manage your home, atelier, and international dispatch locations for streamlined checkout.
              </p>
            </div>

            <div className="ds-addresses-header-actions">
              <Link to="/me" className="ds-btn ds-btn-outline ds-btn-sm">
                ← BACK TO PROFILE
              </Link>
              <button
                type="button"
                className="ds-btn ds-btn-sm"
                onClick={handleOpenAddModal}
              >
                + ADD NEW ADDRESS
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="ds-addresses-content">
        <div className="ds-container-wide">
          {loading ? (
            <Loader />
          ) : addresses.length === 0 ? (
            <div className="ds-addresses-empty-state">
              <span className="ds-empty-glyph">∅</span>
              <h3 className="ds-empty-heading">NO SAVED ADDRESSES YET</h3>
              <p className="ds-empty-text">
                You have not registered any delivery destinations yet. Add an address now to
                expedite future frameset and component checkouts.
              </p>
              <button
                type="button"
                className="ds-btn"
                onClick={handleOpenAddModal}
              >
                + ADD YOUR FIRST ADDRESS →
              </button>
            </div>
          ) : (
            <div className="ds-addresses-grid">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`ds-address-card ${addr.isDefault ? 'is-default-card' : ''}`}
                >
                  <div className="ds-address-card-top">
                    <div className="ds-address-badge-group">
                      <span className="ds-address-label-badge">{addr.label || 'Home'}</span>
                      {addr.isDefault && (
                        <span className="ds-address-default-badge">PRIMARY DISPATCH</span>
                      )}
                    </div>

                    <div className="ds-address-actions-top">
                      <button
                        type="button"
                        className="ds-addr-icon-btn"
                        onClick={() => handleOpenEditModal(addr)}
                        title="Edit address"
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        className="ds-addr-icon-btn ds-addr-delete-btn"
                        onClick={() => handleDelete(addr._id)}
                        title="Delete address"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  <div className="ds-address-card-body">
                    <h4 className="ds-recipient-name">{addr.recipientName}</h4>
                    <span className="ds-recipient-phone">{addr.phone}</span>

                    <address className="ds-address-lines">
                      <div>{addr.addressLine1}</div>
                      {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                      <div>
                        {addr.city}
                        {addr.province ? `, ${addr.province}` : ''} {addr.postalCode}
                      </div>
                      <div className="ds-address-country">{addr.country}</div>
                    </address>
                  </div>

                  <div className="ds-address-card-footer">
                    {addr.isDefault ? (
                      <span className="ds-default-indicator">✓ DEFAULT DISPATCH LOCATION</span>
                    ) : (
                      <button
                        type="button"
                        className="ds-btn ds-btn-outline ds-btn-sm"
                        onClick={() => handleSetDefault(addr._id)}
                      >
                        SET AS DEFAULT
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          ADD / EDIT ADDRESS MODAL
          ========================================================================= */}
      {modalOpen && (
        <div className="ds-modal-overlay" onClick={handleCloseModal}>
          <div
            className="ds-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ds-modal-header">
              <span className="editorial-label">
                {editingId ? 'EDIT DISPATCH LOCATION' : 'NEW DISPATCH LOCATION'}
              </span>
              <button
                type="button"
                className="ds-modal-close"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="ds-modal-form">
              {/* Label */}
              <div className="ds-form-group">
                <label className="ds-label" htmlFor="modal-label">
                  ADDRESS LABEL
                </label>
                <select
                  id="modal-label"
                  name="label"
                  className="ds-input"
                  value={formData.label}
                  onChange={handleChange}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Atelier">Atelier</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Recipient & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="modal-recipient">
                    RECIPIENT NAME *
                  </label>
                  <input
                    type="text"
                    id="modal-recipient"
                    name="recipientName"
                    className={`ds-input ${formErrors.recipientName ? 'ds-input-error' : ''}`}
                    placeholder="Full Name"
                    value={formData.recipientName}
                    onChange={handleChange}
                  />
                  {formErrors.recipientName && (
                    <span className="ds-error-text">{formErrors.recipientName}</span>
                  )}
                </div>

                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="modal-phone">
                    CONTACT PHONE *
                  </label>
                  <input
                    type="tel"
                    id="modal-phone"
                    name="phone"
                    className={`ds-input ${formErrors.phone ? 'ds-input-error' : ''}`}
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {formErrors.phone && (
                    <span className="ds-error-text">{formErrors.phone}</span>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div className="ds-form-group">
                <label className="ds-label" htmlFor="modal-address1">
                  STREET ADDRESS *
                </label>
                <input
                  type="text"
                  id="modal-address1"
                  name="addressLine1"
                  className={`ds-input ${formErrors.addressLine1 ? 'ds-input-error' : ''}`}
                  placeholder="Carrer de Valencia 18"
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
                {formErrors.addressLine1 && (
                  <span className="ds-error-text">{formErrors.addressLine1}</span>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="ds-form-group">
                <label className="ds-label" htmlFor="modal-address2">
                  APARTMENT, UNIT, SUITE (OPTIONAL)
                </label>
                <input
                  type="text"
                  id="modal-address2"
                  name="addressLine2"
                  className="ds-input"
                  placeholder="Floor 3, Door B"
                  value={formData.addressLine2}
                  onChange={handleChange}
                />
              </div>

              {/* City & Province */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="modal-city">
                    CITY *
                  </label>
                  <input
                    type="text"
                    id="modal-city"
                    name="city"
                    className={`ds-input ${formErrors.city ? 'ds-input-error' : ''}`}
                    placeholder="Barcelona"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {formErrors.city && (
                    <span className="ds-error-text">{formErrors.city}</span>
                  )}
                </div>

                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="modal-province">
                    PROVINCE / STATE
                  </label>
                  <input
                    type="text"
                    id="modal-province"
                    name="province"
                    className="ds-input"
                    placeholder="Catalunya"
                    value={formData.province}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="modal-postal">
                    POSTAL CODE *
                  </label>
                  <input
                    type="text"
                    id="modal-postal"
                    name="postalCode"
                    className={`ds-input ${formErrors.postalCode ? 'ds-input-error' : ''}`}
                    placeholder="08007"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                  {formErrors.postalCode && (
                    <span className="ds-error-text">{formErrors.postalCode}</span>
                  )}
                </div>

                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="modal-country">
                    COUNTRY *
                  </label>
                  <select
                    id="modal-country"
                    name="country"
                    className="ds-input"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    {COUNTRIES_LIST.map((cName) => (
                      <option key={cName} value={cName}>
                        {cName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Checkbox */}
              <div className="ds-checkbox-group" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="modal-isDefault"
                  name="isDefault"
                  className="ds-checkbox"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                <label htmlFor="modal-isDefault" className="ds-checkbox-label">
                  SET AS PRIMARY DISPATCH LOCATION
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="ds-btn ds-btn-outline"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="ds-btn"
                  disabled={submitting}
                >
                  {submitting ? 'SAVING...' : editingId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
