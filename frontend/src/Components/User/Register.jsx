import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearErrors } from '../../actions/userActions';
import AuthLayout from './AuthLayout';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
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

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (validate()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      // Prepare form data for user registration
      const registrationData = new FormData();
      registrationData.set('name', fullName);
      registrationData.set('email', email);
      registrationData.set('password', password);

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