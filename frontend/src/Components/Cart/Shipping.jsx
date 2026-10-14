import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { countries } from 'countries-list';
import axios from 'axios';
import { toast } from 'react-toastify';
import MetaData from '../Layout/MetaData';
import CheckoutSteps from './CheckoutSteps';
import { getToken, getAdminConfig } from '../../Utils/helpers';
import './Shipping.css';

const COUNTRIES_LIST = Object.values(countries).map((c) => c.name).sort();

const Shipping = ({ shipping = {}, saveShippingInfo }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  // Pre-seed with addresses from redux user if available
  const initialAddresses = user?.addresses && Array.isArray(user.addresses) ? user.addresses : [];
  const [savedAddresses, setSavedAddresses] = useState(initialAddresses);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses.find((a) => a.isDefault)?._id || initialAddresses[0]?._id || null
  );
  const [useNewAddress, setUseNewAddress] = useState(initialAddresses.length === 0);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New address form fields
  const [recipientName, setRecipientName] = useState(
    shipping.recipientName || user?.name || ''
  );
  const [phoneNo, setPhoneNo] = useState(
    shipping.phoneNo || user?.phone || ''
  );
  const [addressLine1, setAddressLine1] = useState(shipping.address || '');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState(shipping.city || '');
  const [province, setProvince] = useState(shipping.province || '');
  const [postalCode, setPostalCode] = useState(shipping.postalCode || '');
  const [country, setCountry] = useState(shipping.country || 'Spain');
  const [addressLabel, setAddressLabel] = useState('Home');

  // Load addresses from API
  useEffect(() => {
    let isMounted = true;

    const fetchAddresses = async () => {
      try {
        const config = getAdminConfig();
        const { data } = await axios.get(
          `${import.meta.env.VITE_API}/me/addresses`,
          config
        );

        if (isMounted && data.success && Array.isArray(data.addresses)) {
          setSavedAddresses(data.addresses);
          if (data.addresses.length > 0) {
            const defaultAddr = data.addresses.find((a) => a.isDefault) || data.addresses[0];
            setSelectedAddressId((prev) => prev || defaultAddr._id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        }
      } catch (err) {
        // If API fails or user not logged in, check initial redux addresses
        if (isMounted) {
          if (initialAddresses.length > 0) {
            setSavedAddresses(initialAddresses);
            setSelectedAddressId(initialAddresses[0]._id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Update user name/phone defaults if loaded late from Redux
  useEffect(() => {
    if (user) {
      if (!recipientName && user.name) setRecipientName(user.name);
      if (!phoneNo && user.phone) setPhoneNo(user.phone);
    }
  }, [user]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setUseNewAddress(false);
  };

  const handleProceedWithSelected = (e) => {
    if (e) e.preventDefault();

    const chosen = savedAddresses.find((a) => a._id === selectedAddressId);
    if (!chosen) {
      toast.error('Please select an address or enter a new one.');
      return;
    }

    const combinedAddress = chosen.addressLine2
      ? `${chosen.addressLine1}, ${chosen.addressLine2}`
      : chosen.addressLine1;

    saveShippingInfo({
      recipientName: chosen.recipientName || user?.name || 'Customer',
      address: combinedAddress,
      city: chosen.city,
      province: chosen.province || '',
      phoneNo: chosen.phone,
      postalCode: chosen.postalCode,
      country: chosen.country,
    });

    toast.success(`Shipping to ${chosen.label || 'Saved Address'}`);
    navigate('/confirm');
  };

  const handleProceedWithNewAddress = async (e) => {
    e.preventDefault();

    if (!recipientName.trim() || !phoneNo.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const combinedAddress = addressLine2.trim()
        ? `${addressLine1.trim()}, ${addressLine2.trim()}`
        : addressLine1.trim();

      // Save to user account if requested or if user has no saved addresses
      if (saveToAccount && (isAuthenticated || getToken())) {
        try {
          const config = getAdminConfig();
          const newAddrPayload = {
            label: addressLabel || 'Delivery',
            recipientName: recipientName.trim(),
            phone: phoneNo.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            city: city.trim(),
            province: province.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            isDefault: savedAddresses.length === 0,
          };
          const { data } = await axios.post(
            `${import.meta.env.VITE_API}/me/addresses`,
            newAddrPayload,
            config
          );
          if (data.success && data.addresses) {
            setSavedAddresses(data.addresses);
          }
        } catch (saveErr) {
          console.warn('Could not auto-save address to account:', saveErr);
        }
      }

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
      toast.error('Failed to save dispatch information.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAddress = savedAddresses.find((a) => a._id === selectedAddressId);

  return (
    <div className="ds-shipping-page">
      <MetaData title="Dispatch Information — Dosnoventa" />
      <div className="ds-shipping-container">
        <CheckoutSteps shipping />

        <div className="ds-shipping-header">
          <div className="ds-shipping-eyebrow">ORDER LOGISTICS // STEP 01</div>
          <h1 className="ds-shipping-title">DISPATCH DESTINATION</h1>
          <p className="ds-shipping-desc">
            {savedAddresses.length > 0
              ? 'Select one of your saved delivery addresses below or enter a new one.'
              : 'Enter your shipping address for global express courier dispatch.'}
          </p>
        </div>

        {/* ==================== SCENARIO 1: USER HAS SAVED ADDRESSES ==================== */}
        {savedAddresses.length > 0 && (
          <div className="ds-shipping-section">
            <div className="ds-section-heading">
              <h2 className="ds-section-title">
                SAVED ADDRESSES ({savedAddresses.length})
              </h2>
              <button
                type="button"
                className={`ds-toggle-new-btn ${useNewAddress ? 'is-active' : ''}`}
                onClick={() => setUseNewAddress(!useNewAddress)}
              >
                {useNewAddress ? '← BACK TO SAVED ADDRESSES' : '+ DELIVER TO A DIFFERENT ADDRESS'}
              </button>
            </div>

            {/* Address Selection Grid (shown when NOT adding new address) */}
            {!useNewAddress && (
              <>
                <div className="ds-saved-grid">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        className={`ds-saved-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleSelectAddress(addr)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSelectAddress(addr);
                          }
                        }}
                      >
                        <div className="ds-saved-card-header">
                          <div className="ds-saved-card-radio">
                            <span className="ds-radio-indicator">
                              {isSelected && <span className="ds-radio-dot" />}
                            </span>
                            <span className="ds-card-label">{addr.label || 'ADDRESS'}</span>
                          </div>
                          {addr.isDefault && (
                            <span className="ds-default-badge">DEFAULT</span>
                          )}
                        </div>

                        <div className="ds-card-body">
                          <div className="ds-card-name">
                            {addr.recipientName || user?.name || 'Customer'}
                          </div>
                          <div className="ds-card-line">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          </div>
                          <div className="ds-card-line">
                            {addr.city}
                            {addr.province ? `, ${addr.province}` : ''} {addr.postalCode}
                          </div>
                          <div className="ds-card-country">{addr.country}</div>
                          <div className="ds-card-phone">TEL: {addr.phone}</div>
                        </div>

                        <div className="ds-card-action">
                          <span className={`ds-card-select-pill ${isSelected ? 'is-active' : ''}`}>
                            {isSelected ? '✓ SELECTED DESTINATION' : 'SELECT THIS ADDRESS'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Primary Proceed Button for Selected Address */}
                <div className="ds-selected-summary-bar">
                  <div className="ds-selected-info">
                    <span className="ds-selected-tag">DELIVERING TO:</span>
                    <strong className="ds-selected-text">
                      {selectedAddress
                        ? `${selectedAddress.recipientName || user?.name || ''} — ${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.country}`
                        : 'No address selected'}
                    </strong>
                  </div>

                  <button
                    id="deliver_selected_btn"
                    type="button"
                    className="ds-shipping-submit-btn"
                    onClick={handleProceedWithSelected}
                    disabled={!selectedAddressId}
                  >
                    DELIVER TO SELECTED ADDRESS →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== SCENARIO 2: ENTER NEW / MANUAL ADDRESS ==================== */}
        {(useNewAddress || savedAddresses.length === 0) && (
          <form onSubmit={handleProceedWithNewAddress} className="ds-shipping-section">
            <div className="ds-section-heading">
              <h2 className="ds-section-title">
                {savedAddresses.length > 0 ? 'ENTER NEW DESTINATION' : 'DELIVERY ADDRESS'}
              </h2>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  className="ds-toggle-new-btn"
                  onClick={() => setUseNewAddress(false)}
                >
                  ← USE A SAVED ADDRESS
                </button>
              )}
            </div>

            <div className="ds-shipping-form-card">
              <div className="ds-form-row">
                <div className="ds-form-group">
                  <label htmlFor="address_label">ADDRESS LABEL (e.g. Home, Studio, Work)</label>
                  <input
                    type="text"
                    id="address_label"
                    placeholder="Home"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                  />
                </div>
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
              </div>

              <div className="ds-form-row">
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
              </div>

              <label className="ds-form-checkbox-label">
                <input
                  type="checkbox"
                  checked={saveToAccount}
                  onChange={(e) => setSaveToAccount(e.target.checked)}
                />
                <span className="ds-checkbox-text">
                  SAVE THIS ADDRESS TO MY ACCOUNT FOR 1-CLICK CHECKOUT IN THE FUTURE
                </span>
              </label>

              <div className="ds-shipping-actions">
                <Link to="/cart" className="ds-back-cart-link">
                  ← RETURN TO CART
                </Link>
                <button
                  id="shipping_btn"
                  type="submit"
                  className="ds-shipping-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'SAVING...' : 'SAVE & CONTINUE TO ORDER REVIEW →'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Return Link when viewing saved addresses */}
        {!useNewAddress && savedAddresses.length > 0 && (
          <div className="ds-shipping-actions">
            <Link to="/cart" className="ds-back-cart-link">
              ← RETURN TO CART
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shipping;
