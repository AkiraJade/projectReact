import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Rating } from '@mui/material';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';

const ReviewSection = ({ productId }) => {
    const { user, isAuthenticated } = useSelector(state => state.auth || {});
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const userReview = reviews.find(
        r => r.user?.toString() === user?._id?.toString() || r.user === user?._id
    );

    const fetchReviews = async () => {
        if (!productId || productId.startsWith('local-') || productId.startsWith('dsnv-')) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${getToken()}` },
                withCredentials: true
            };
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/reviews?id=${productId}`,
                config
            );
            setReviews(data.reviews || []);
        } catch (err) {
            // Silently ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    // Pre-fill form if user already reviewed this product
    useEffect(() => {
        if (userReview) {
            setRating(userReview.rating || 5);
            setComment(userReview.comment || '');
        }
    }, [userReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!rating || rating < 1) {
            setError('Please select a star rating (1 to 5).');
            return;
        }
        if (!comment.trim()) {
            setError('Please write a review comment.');
            return;
        }

        setSubmitting(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                withCredentials: true
            };
            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/review`,
                { rating, comment, productId },
                config
            );
            setSuccess(userReview ? 'Your review has been updated!' : 'Review submitted successfully!');
            fetchReviews();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Only riders who have ordered and received this item can submit a review.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: '#1a1a1a' }}>
            <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '12px', marginBottom: '32px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#C83226', fontWeight: 600 }}>
                    RIDER VERIFIED REVIEWS
                </span>
                <h2 style={{ fontSize: '24px', letterSpacing: '1px', fontWeight: 700, margin: '6px 0 0' }}>
                    RATINGS & FEEDBACK {reviews.length > 0 ? `(${reviews.length})` : ''}
                </h2>
            </div>

            {/* Form for authenticated users */}
            {isAuthenticated ? (
                <div style={{
                    background: '#f8f8fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '28px',
                    marginBottom: '40px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
                            {userReview ? 'UPDATE YOUR REVIEW' : 'RATE & REVIEW THIS MACHINE'}
                        </h3>
                        <span style={{ fontSize: '11px', letterSpacing: '1px', color: '#6b7280' }}>
                            VERIFIED BUYERS ONLY
                        </span>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            marginBottom: '16px'
                        }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            background: '#d1fae5',
                            color: '#065f46',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            marginBottom: '16px'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
                                YOUR RATING (1–5 STARS) *
                            </label>
                            <Rating
                                id="review-stars-input"
                                name="review-rating"
                                value={rating}
                                onChange={(e, newVal) => setRating(newVal)}
                                size="large"
                                sx={{ color: '#C83226' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
                                REVIEW DETAILS *
                            </label>
                            <textarea
                                id="review-comment-input"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                placeholder="Describe performance, weld quality, street handling, or component finish..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    fontFamily: 'inherit',
                                    background: '#fff',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                Notice: Inappropriate language and profanity will be automatically filtered.
                            </span>
                        </div>

                        <button
                            id="submit-review-btn"
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: '#1a1a1a',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 28px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                letterSpacing: '2px',
                                fontWeight: 600,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {submitting ? 'PROCESSING...' : (userReview ? 'UPDATE REVIEW' : 'SUBMIT REVIEW')}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{
                    background: '#f8f8fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '40px',
                    fontSize: '14px',
                    color: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <strong>Want to review this product?</strong> Only verified customers who ordered this item can submit a review.
                    </div>
                    <a
                        href="/login"
                        style={{
                            background: '#1a1a1a',
                            color: '#fff',
                            padding: '8px 18px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            letterSpacing: '1px',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}
                    >
                        SIGN IN →
                    </a>
                </div>
            )}

            {/* Existing Reviews List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                    Loading reviews...
                </div>
            ) : reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reviews.map((rev) => (
                        <div key={rev._id} style={{
                            borderBottom: '1px solid #e5e7eb',
                            paddingBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: '#1a1a1a',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '13px'
                                }}>
                                    {rev.name ? rev.name.charAt(0).toUpperCase() : 'R'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                                        {rev.name}
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '10px',
                                            background: '#dcfce7',
                                            color: '#15803d',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            letterSpacing: '0.5px',
                                            fontWeight: 600
                                        }}>
                                            VERIFIED RIDER
                                        </span>
                                    </div>
                                    <Rating
                                        value={Number(rev.rating) || 0}
                                        readOnly
                                        size="small"
                                        sx={{ color: '#C83226' }}
                                    />
                                </div>
                            </div>
                            <p style={{
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: 1.6,
                                margin: '8px 0 0 48px'
                            }}>
                                {rev.comment}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>
                    No reviews yet for this product. Be the first verified buyer to rate it.
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
