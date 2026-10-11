import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { countries } from 'countries-list';
import { register, clearErrors } from '../../actions/userActions';
import AuthLayout from './AuthLayout';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';

const COUNTRIES_LIST = Object.values(countries).map((c) => c.name).sort();

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // Optional Profile Picture
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Optional Address State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Spain',
    isDefault: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { firstName, lastName, email, password, confirmPassword, agreeTerms } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, error, loading } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Welcome to the brotherhood.');
      navigate('/');
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [isAuthenticated, error, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Avatar change and client validation
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported image format. Please select a JPG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum file size is 5MB.');
      return;
    }

    setAvatar(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview('');
  };

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'FIRST NAME IS REQUIRED';
    if (!lastName.trim()) errs.lastName = 'LAST NAME IS REQUIRED';

    if (!email.trim()) {
      errs.email = 'EMAIL ADDRESS IS REQUIRED';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'VALID EMAIL FORMAT REQUIRED';
    }

    if (!password) {
      errs.password = 'PASSWORD IS REQUIRED';
    } else if (password.length < 6) {
      errs.password = 'MINIMUM 6 CHARACTERS REQUIRED';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'PASSWORDS DO NOT MATCH';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'YOU MUST AGREE TO TERMS & PRIVACY POLICY';
    }

    // Validate address if user toggled it open OR typed in any address field
    const hasStartedAddress =
      showAddressForm ||
      Object.entries(addressData).some(
        ([k, v]) => k !== 'label' && k !== 'isDefault' && k !== 'country' && typeof v === 'string' && v.trim() !== ''
      );

    if (hasStartedAddress && showAddressForm) {
      if (!addressData.recipientName.trim()) {
        errs.recipientName = 'RECIPIENT NAME IS REQUIRED';
      }
      if (!addressData.phone.trim()) {
        errs.phone = 'PHONE NUMBER IS REQUIRED';
      }
      if (!addressData.addressLine1.trim()) {
        errs.addressLine1 = 'ADDRESS LINE 1 IS REQUIRED';
      }
      if (!addressData.city.trim()) {
        errs.city = 'CITY IS REQUIRED';
      }
      if (!addressData.postalCode.trim()) {
        errs.postalCode = 'POSTAL CODE IS REQUIRED';
      }
      if (!addressData.country.trim()) {
        errs.country = 'COUNTRY IS REQUIRED';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (validate()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const registrationData = new FormData();
      registrationData.set('name', fullName);
      registrationData.set('email', email.trim());
      registrationData.set('password', password);

      // Attach avatar if provided
      if (avatar) {
        registrationData.set('avatar', avatar);
      }

      // Attach address if provided and enabled
      if (showAddressForm && addressData.addressLine1.trim()) {
        registrationData.set('label', addressData.label || 'Home');
        registrationData.set('recipientName', addressData.recipientName.trim() || fullName);
        registrationData.set('phone', addressData.phone.trim());
        registrationData.set('addressLine1', addressData.addressLine1.trim());
        registrationData.set('addressLine2', (addressData.addressLine2 || '').trim());
        registrationData.set('city', addressData.city.trim());
        registrationData.set('province', (addressData.province || '').trim());
        registrationData.set('postalCode', addressData.postalCode.trim());
        registrationData.set('country', addressData.country);
        registrationData.set('isDefault', String(addressData.isDefault));
      }

      dispatch(register(registrationData));
    }
  };

  return (
    <>
      <MetaData title="JOIN THE BROTHERHOOD — DOSNOVENTA®" />

      <AuthLayout
        title="JOIN THE BROTHERHOOD."
        subtitle="Become part of the global underground cycling syndicate. Gain priority access to limited frame drops."
        imageSide="right"
      >
        <form onSubmit={submitHandler} noValidate>
          {/* Avatar Upload with Live Preview */}
          <div className="ds-form-group ds-avatar-upload-group" style={{ marginBottom: '2rem' }}>
            <label className="ds-label">PROFILE PICTURE (OPTIONAL)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#161618',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>👤</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label
                  htmlFor="avatar-upload"
                  className="ds-btn ds-btn-outline"
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    letterSpacing: '0.12em',
                  }}
                >
                  {avatarPreview ? 'CHANGE PHOTO' : 'SELECT PHOTO'}
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  name="avatar"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="ds-btn"
                    style={{
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.68rem',
                      background: 'rgba(255, 51, 68, 0.15)',
                      color: '#ff4d4d',
                      border: '1px solid rgba(255, 51, 68, 0.3)',
                    }}
                  >
                    REMOVE
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="ds-form-group">
              <label className="ds-label" htmlFor="firstName">
                FIRST NAME
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`ds-input ${errors.firstName ? 'ds-input-error' : ''}`}
                placeholder="Marc"
                value={firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="ds-error-text">{errors.firstName}</span>}
            </div>

            <div className="ds-form-group">
              <label className="ds-label" htmlFor="lastName">
                LAST NAME
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`ds-input ${errors.lastName ? 'ds-input-error' : ''}`}
                placeholder="Roca"
                value={lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="ds-error-text">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="ds-form-group">
            <label className="ds-label" htmlFor="register-email">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="register-email"
              name="email"
              className={`ds-input ${errors.email ? 'ds-input-error' : ''}`}
              placeholder="rider@dosnoventabikes.com"
              value={email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="ds-error-text">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="ds-form-group">
            <label className="ds-label" htmlFor="register-password">
              PASSWORD
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              name="password"
              className={`ds-input ${errors.password ? 'ds-input-error' : ''}`}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="ds-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
            {errors.password && <span className="ds-error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="ds-form-group">
            <label className="ds-label" htmlFor="confirmPassword">
              CONFIRM PASSWORD
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              className={`ds-input ${errors.confirmPassword ? 'ds-input-error' : ''}`}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="ds-error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* =========================================================================
              OPTIONAL DELIVERY ADDRESS SECTION (Collapsible)
              ========================================================================= */}
          <div
            style={{
              margin: '2rem 0',
              padding: '1.25rem',
              background: '#111215',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowAddressForm(!showAddressForm)}
            >
              <div>
                <span className="editorial-label" style={{ fontSize: '0.68rem', display: 'block' }}>
                  DELIVERY ADDRESS
                </span>
                <strong style={{ fontSize: '0.88rem', letterSpacing: '0.05em', color: '#fff' }}>
                  {showAddressForm ? 'HIDE DELIVERY ADDRESS' : '+ ADD DELIVERY ADDRESS (OPTIONAL)'}
                </strong>
              </div>
              <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>
                {showAddressForm ? '−' : '+'}
              </span>
            </div>

            {showAddressForm && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Address Label */}
                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="address-label">
                    ADDRESS LABEL
                  </label>
                  <select
                    id="address-label"
                    name="label"
                    className="ds-input"
                    value={addressData.label}
                    onChange={handleAddressChange}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Atelier">Atelier</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Recipient Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="ds-form-group">
                    <label className="ds-label" htmlFor="recipientName">
                      RECIPIENT FULL NAME *
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      className={`ds-input ${errors.recipientName ? 'ds-input-error' : ''}`}
                      placeholder={firstName ? `${firstName} ${lastName}` : 'Full Name'}
                      value={addressData.recipientName}
                      onChange={handleAddressChange}
                    />
                    {errors.recipientName && (
                      <span className="ds-error-text">{errors.recipientName}</span>
                    )}
                  </div>

                  <div className="ds-form-group">
                    <label className="ds-label" htmlFor="address-phone">
                      CONTACT PHONE *
                    </label>
                    <input
                      type="tel"
                      id="address-phone"
                      name="phone"
                      className={`ds-input ${errors.phone ? 'ds-input-error' : ''}`}
                      placeholder="+34 600 000 000"
                      value={addressData.phone}
                      onChange={handleAddressChange}
                    />
                    {errors.phone && <span className="ds-error-text">{errors.phone}</span>}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="addressLine1">
                    STREET ADDRESS *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    className={`ds-input ${errors.addressLine1 ? 'ds-input-error' : ''}`}
                    placeholder="Carrer de Valencia 18"
                    value={addressData.addressLine1}
                    onChange={handleAddressChange}
                  />
                  {errors.addressLine1 && (
                    <span className="ds-error-text">{errors.addressLine1}</span>
                  )}
                </div>

                {/* Address Line 2 */}
                <div className="ds-form-group">
                  <label className="ds-label" htmlFor="addressLine2">
                    APARTMENT, UNIT, SUITE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    className="ds-input"
                    placeholder="Floor 3, Door B"
                    value={addressData.addressLine2}
                    onChange={handleAddressChange}
                  />
                </div>

                {/* City & Province */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="ds-form-group">
                    <label className="ds-label" htmlFor="address-city">
                      CITY *
                    </label>
                    <input
                      type="text"
                      id="address-city"
                      name="city"
                      className={`ds-input ${errors.city ? 'ds-input-error' : ''}`}
                      placeholder="Barcelona"
                      value={addressData.city}
                      onChange={handleAddressChange}
                    />
                    {errors.city && <span className="ds-error-text">{errors.city}</span>}
                  </div>

                  <div className="ds-form-group">
                    <label className="ds-label" htmlFor="address-province">
                      STATE / PROVINCE / REGION
                    </label>
                    <input
                      type="text"
                      id="address-province"
                      name="province"
                      className="ds-input"
                      placeholder="Catalunya"
                      value={addressData.province}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                {/* Postal Code & Country */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="ds-form-group">
                    <label className="ds-label" htmlFor="address-postalCode">
                      POSTAL CODE *
                    </label>
                    <input
                      type="text"
                      id="address-postalCode"
                      name="postalCode"
                      className={`ds-input ${errors.postalCode ? 'ds-input-error' : ''}`}
                      placeholder="08007"
                      value={addressData.postalCode}
                      onChange={handleAddressChange}
                    />
                    {errors.postalCode && (
                      <span className="ds-error-text">{errors.postalCode}</span>
                    )}
                  </div>

                  <div className="ds-form-group">
                    <label className="ds-label" htmlFor="address-country">
                      COUNTRY *
                    </label>
                    <select
                      id="address-country"
                      name="country"
                      className="ds-input"
                      value={addressData.country}
                      onChange={handleAddressChange}
                    >
                      {COUNTRIES_LIST.map((countryName) => (
                        <option key={countryName} value={countryName}>
                          {countryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Default Checkbox */}
                <div className="ds-checkbox-group" style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="address-default"
                    name="isDefault"
                    className="ds-checkbox"
                    checked={addressData.isDefault}
                    onChange={handleAddressChange}
                  />
                  <label htmlFor="address-default" className="ds-checkbox-label" style={{ fontSize: '0.72rem' }}>
                    SET AS PRIMARY DISPATCH ADDRESS
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="ds-checkbox-group">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              className="ds-checkbox"
              checked={agreeTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeTerms" className="ds-checkbox-label">
              I AGREE TO THE DOSNOVENTA TERMS OF SERVICE AND PRIVACY POLICY.
            </label>
          </div>
          {errors.agreeTerms && (
            <span className="ds-error-text" style={{ marginTop: '-1rem', marginBottom: '1.2rem' }}>
              {errors.agreeTerms}
            </span>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="ds-btn"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
          </button>

          {/* Bottom link to Login */}
          <div className="ds-auth-footer-prompt">
            ALREADY HAVE AN ACCOUNT?
            <Link to="/login" className="ds-auth-footer-link">
              LOG IN →
            </Link>
          </div>
        </form>
      </AuthLayout>
    </>
  );
};

export default Register;