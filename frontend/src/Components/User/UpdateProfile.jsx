import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import MetaData from '../Layout/MetaData';
import { updateProfile, clearErrors } from '../../actions/userActions';
import { UPDATE_PROFILE_RESET } from '../../constants/userConstants';
import './Profile.css';

const UpdateProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png'
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth || {});
  const { isUpdated, error, loading } = useSelector((state) => state.user || {});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.avatar?.url) {
        setAvatarPreview(user.avatar.url);
      }
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success('Rider profile updated successfully');
      dispatch({ type: UPDATE_PROFILE_RESET });
      navigate('/me');
    }
  }, [dispatch, user, error, isUpdated, navigate]);

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

  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.set('name', name.trim());
    formData.set('email', email.trim());
    if (avatar) {
      formData.set('avatar', avatar);
    }

    dispatch(updateProfile(formData));
  };

  return (
    <div className="ds-profile-page">
      <MetaData title="Update Rider Profile — Dosnoventa" />

      <section className="ds-profile-header">
        <div className="ds-container-wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="editorial-label">ACCOUNT MODIFICATION</span>
              <h1 className="ds-profile-title">EDIT PROFILE</h1>
            </div>
            <Link to="/me" className="ds-btn ds-btn-outline ds-btn-sm">
              ← CANCEL &amp; RETURN
            </Link>
          </div>
        </div>
      </section>

      <main className="ds-profile-main">
        <div className="ds-container-narrow">
          <div className="ds-profile-dossier-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={submitHandler} noValidate>
              {/* Avatar Section */}
              <div className="ds-form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="ds-label">PROFILE PICTURE</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: '#161618',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="update-avatar-file"
                      className="ds-btn ds-btn-outline ds-btn-sm"
                      style={{ cursor: 'pointer' }}
                    >
                      CHOOSE NEW AVATAR
                    </label>
                    <input
                      type="file"
                      id="update-avatar-file"
                      name="avatar"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem', margin: 0 }}>
                      JPG, PNG, or WebP. Maximum 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="ds-form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="ds-label" htmlFor="name_field">
                  FULL NAME
                </label>
                <input
                  type="text"
                  id="name_field"
                  className="ds-input"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="ds-form-group" style={{ marginBottom: '2rem' }}>
                <label className="ds-label" htmlFor="email_field">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="email_field"
                  className="ds-input"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                <Link to="/me" className="ds-btn ds-btn-outline">
                  CANCEL
                </Link>
                <button
                  type="submit"
                  className="ds-btn"
                  disabled={loading}
                >
                  {loading ? 'SAVING CHANGES...' : 'SAVE CHANGES →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateProfile;