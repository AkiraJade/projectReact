import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { countries } from 'countries-list';
import axios from 'axios';
import { toast } from 'react-toastify';
import MetaData from '../Layout/MetaData';
import CheckoutSteps from './CheckoutSteps';
import { getToken } from '../../Utils/helpers';
import './Shipping.css';

const COUNTRIES_LIST = Object.values(countries).map((c) => c.name).sort();

const Shipping = ({ shipping, saveShippingInfo }) => {
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New address state
  const [recipientName, setRecipientName] = useState(shipping.recipientName || '');
  const [phoneNo, setPhoneNo] = useState(shipping.phoneNo || '');
  const [addressLine1, setAddressLine1] = useState(shipping.address || '');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState(shipping.city || '');
  const [province, setProvince] = useState(shipping.province || '');
  const [postalCode, setPostalCode] = useState(shipping.postalCode || '');
  const [country, setCountry] = useState(shipping.country || 'Spain');

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

  useEffect(() => {
    let isMounted = true;
    const fetchSavedAddresses = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API}/me/addresses`,
          getAuthHeader()
        );
        if (isMounted && data.success && Array.isArray(data.addresses)) {
          setSavedAddresses(data.addresses);
          if (data.addresses.length > 0) {
            // Find default address or first address
            const defaultAddr = data.addresses.find((a) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr._id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        }
      } catch (err) {
        // Not authenticated or network issue; allow manual entry
        if (isMounted) {
          setUseNewAddress(true);
        }
      } finally {
        if (isMounted) {
          setLoadingAddresses(false);
        }
      }
    };

    fetchSavedAddresses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSaved = (addr) => {
    setSelectedAddressId(addr._id);
    setUseNewAddress(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!useNewAddress && selectedAddressId) {
      // Use selected saved address
      const chosen = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!chosen) {
        toast.error('Selected address could not be found.');
        return;
      }

      const combinedAddress = chosen.addressLine2
        ? `${chosen.addressLine1}, ${chosen.addressLine2}`
        : chosen.addressLine1;

      saveShippingInfo({
        recipientName: chosen.recipientName,
        address: combinedAddress,
        city: chosen.city,
        province: chosen.province,
        phoneNo: chosen.phone,
        postalCode: chosen.postalCode,
        country: chosen.country,
      });

      navigate('/confirm');
      return;
    }

    // Manual address validation
    if (!addressLine1.trim() || !city.trim() || !phoneNo.trim() || !postalCode.trim() || !country.trim()) {
      toast.error('Please fill in all required shipping fields.');
      return;
    }

    setSubmitting(true);

    try {
      // Optionally save new address to account
      if (saveToAccount) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API}/me/addresses`,
            {
              label: 'Other',
              recipientName: recipientName.trim(),
              phone: phoneNo.trim(),
              addressLine1: addressLine1.trim(),
              addressLine2: addressLine2.trim(),
              city: city.trim(),
              province: province.trim(),
              postalCode: postalCode.trim(),
              country: country.trim(),
              isDefault: savedAddresses.length === 0,
            },
            getAuthHeader()
          );
          toast.success('Address saved to your account.');
        } catch (saveErr) {
          console.warn('Could not auto-save address to account:', saveErr);
        }
      }

      const combinedAddress = addressLine2.trim()
        ? `${addressLine1.trim()}, ${addressLine2.trim()}`
        : addressLine1.trim();

      saveShippingInfo({
        recipientName: recipientName.trim(),
        address: combinedAddress,
        city: city.trim(),
        province: province.trim(),
        phoneNo: phoneNo.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      });

      navigate('/confirm');
    } catch (err) {
      toast.error('Failed to proceed with dispatch information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ds-shipping-page">
      <MetaData title="Dispatch Information — Dosnoventa" />
      <div className="ds-shipping-container">
        <CheckoutSteps shipping />

        <div className="ds-shipping-header">
          <div className="ds-shipping-eyebrow">ORDER LOGISTICS // STEP 01</div>
          <h1 className="ds-shipping-title">DISPATCH DESTINATION</h1>
        </div>

        <form onSubmit={submitHandler}>
          {/* Saved Addresses Section (if any exist) */}
          {savedAddresses.length > 0 && (
            <div className="ds-shipping-section">
              <div className="ds-section-heading">
                <h2 className="ds-section-title">SAVED DISPATCH DESTINATIONS</h2>
                <button
                  type="button"
                  className={`ds-toggle-new-btn ${useNewAddress ? 'is-active' : ''}`}
                  onClick={() => setUseNewAddress(!useNewAddress)}
                >
                  {useNewAddress ? 'SELECT SAVED ADDRESS' : '+ ENTER NEW ADDRESS'}
                </button>
              </div>

              {!useNewAddress && (
                <div className="ds-saved-grid">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        className={`ds-saved-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleSelectSaved(addr)}
                      >
                        <div className="ds-saved-card-header">
                          <div className="ds-saved-card-radio">
                            <span className="ds-radio-indicator">
                              {isSelected && <span className="ds-radio-dot"></span>}
                            </span>
                            <span className="ds-card-label">{addr.label}</span>
                          </div>
                          {addr.isDefault && (
                            <span className="ds-default-badge">DEFAULT</span>
                          )}
                        </div>

                        <div className="ds-card-body">
                          {addr.recipientName && (
                            <div className="ds-card-name">{addr.recipientName}</div>
                          )}
                          <div>
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          </div>
                          <div>
                            {addr.city}
                            {addr.province ? `, ${addr.province}` : ''} {addr.postalCode}
                          </div>
                          <div>{addr.country}</div>
                          <div className="ds-card-phone">TEL: {addr.phone}</div>
                        </div>

                        <button
                          type="button"
                          className="ds-card-select-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSaved(addr);
                          }}
                        >
                          {isSelected ? 'DESTINATION SELECTED' : 'DELIVER TO THIS ADDRESS'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* New / Manual Address Form */}
          {(useNewAddress || savedAddresses.length === 0) && (
            <div className="ds-shipping-section">
              <div className="ds-section-heading">
                <h2 className="ds-section-title">
                  {savedAddresses.length > 0 ? 'NEW DISPATCH DESTINATION' : 'SHIPPING ADDRESS'}
                </h2>
              </div>

              <div className="ds-shipping-form-card">
                <div className="ds-form-row">
                  <div className="ds-form-group">
                    <label htmlFor="recipient_name">RECIPIENT FULL NAME *</label>
                    <input
                      type="text"
                      id="recipient_name"
                      placeholder="e.g. MARCUS AURELIUS"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ds-form-group">
                    <label htmlFor="phone_field">CONTACT PHONE NUMBER *</label>
                    <input
                      type="tel"
                      id="phone_field"
                      placeholder="+34 600 000 000"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="ds-form-group">
                  <label htmlFor="address_field">STREET ADDRESS (LINE 1) *</label>
                  <input
                    type="text"
                    id="address_field"
                    placeholder="e.g. Carrer de Pallars 108"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                  />
                </div>

                <div className="ds-form-group">
                  <label htmlFor="address_line_2">APARTMENT / SUITE / UNIT (OPTIONAL)</label>
                  <input
                    type="text"
                    id="address_line_2"
                    placeholder="e.g. Planta 3, Puerta B"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>

                <div className="ds-form-row">
                  <div className="ds-form-group">
                    <label htmlFor="city_field">CITY *</label>
                    <input
                      type="text"
                      id="city_field"
                      placeholder="e.g. Barcelona"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ds-form-group">
                    <label htmlFor="province_field">STATE / PROVINCE</label>
                    <input
                      type="text"
                      id="province_field"
                      placeholder="e.g. Catalonia"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ds-form-row">
                  <div className="ds-form-group">
                    <label htmlFor="postal_code_field">POSTAL CODE *</label>
                    <input
                      type="text"
                      id="postal_code_field"
                      placeholder="e.g. 08018"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ds-form-group">
                    <label htmlFor="country_field">COUNTRY *</label>
                    <select
                      id="country_field"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="ds-form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={saveToAccount}
                    onChange={(e) => setSaveToAccount(e.target.checked)}
                  />
                  <span className="ds-checkbox-text">
                    SAVE THIS ADDRESS TO MY DOSNOVENTA ACCOUNT FOR FUTURE ORDERS
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="ds-shipping-actions">
            <Link to="/cart" className="ds-back-cart-link">
              ← RETURN TO CART
            </Link>
            <button
              id="shipping_btn"
              type="submit"
              className="ds-shipping-submit-btn"
              disabled={submitting || (!useNewAddress && !selectedAddressId)}
            >
              {submitting ? 'PROCESSING...' : 'CONTINUE TO ORDER REVIEW →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
