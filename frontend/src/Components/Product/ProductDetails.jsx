import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails, clearErrors } from '../../actions/productActions';
import { DOSNOVENTA_CATALOG } from '../../data/dosnoventaProducts';
import MetaData from '../Layout/MetaData';
import ReviewSection from '../Review/ReviewSection';
import './ProductDetails.css';

const ProductDetails = ({ addItemToCart, cartItems = [] }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { loading, error, product: apiProduct } = useSelector(
    (state) => state.productDetails || {}
  );

  // Fallback to local curated Dosnoventa catalog if apiProduct not found or offline
  const product = useMemo(() => {
    if (apiProduct && apiProduct._id === id) {
      return apiProduct;
    }
    const localMatch = DOSNOVENTA_CATALOG.find((p) => p._id === id);
    return localMatch || apiProduct || DOSNOVENTA_CATALOG[0];
  }, [apiProduct, id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '54 (M)');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'geometry'

  useEffect(() => {
    try {
      dispatch(getProductDetails(id));
    } catch (e) {
      // safe fallback
    }
    window.scrollTo(0, 0);
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      if (product.colors?.length) setSelectedColor(product.colors[0]);
      setSelectedImageIndex(0);
    }
  }, [product]);

  const images = product?.images?.length
    ? product.images
    : [{ url: '/images/Dosnoventa_company_x.webp', alt: product?.name }];

  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;

  const handleIncrease = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (addItemToCart && product) {
      addItemToCart(product._id, quantity);
    }
  };

  const formattedPrice = product?.price
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(product.price)
    : '€1,450.00';

  if (!product) {
    return (
      <div className="ds-product-loading ds-container">
        <span className="editorial-label">LOADING MACHINE SPECIFICATIONS...</span>
      </div>
    );
  }

  return (
    <div className="ds-product-details-page">
      <MetaData title={`${product.name} — Dosnoventa Fixed Gear Bikes`} />

      <div className="ds-container-wide">
        {/* Breadcrumb Header */}
        <nav className="ds-product-breadcrumb" aria-label="Breadcrumb">
          <Link to="/shop" className="ds-bc-link">SHOP</Link>
          <span className="ds-bc-separator">/</span>
          <span className="ds-bc-category">{product.category || 'BIKES'}</span>
          <span className="ds-bc-separator">/</span>
          <span className="ds-bc-current">{product.name}</span>
        </nav>

        {/* Main Product Layout Grid */}
        <div className="ds-product-grid-layout">
          {/* LEFT: Imagery Column */}
          <div className="ds-product-gallery-col">
            <div className="ds-product-main-view">
              <img
                src={currentImage}
                alt={product.name}
                className="ds-product-featured-img"
              />
              <div className="ds-gallery-overlay-badge">
                <span>{product.material || 'ATELIER QUALITY'}</span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="ds-gallery-thumbs-row">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`ds-thumb-btn ${selectedImageIndex === idx ? 'is-active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Buy Box & Specs */}
          <div className="ds-product-info-col">
            <div className="ds-product-info-inner">
              <div className="ds-product-eyebrow">
                <span className="editorial-badge">{product.category || 'COMPLETE BUILD'}</span>
                <span className="ds-product-sku">ATELIER // {product._id?.substring(0, 8)}</span>
              </div>

              <h1 className="ds-product-title">{product.name}</h1>

              {product.tagline && (
                <p className="ds-product-tagline">{product.tagline}</p>
              )}

              {/* Price Block */}
              <div className="ds-product-price-section">
                <span className="ds-price-label">PRICE (INCL. TAXES)</span>
                <div className="ds-price-value">{formattedPrice}</div>
              </div>

              {/* Description */}
              <p className="ds-product-description">{product.description}</p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="ds-option-group">
                  <div className="ds-option-header">
                    <span className="ds-option-label">FRAME SIZE</span>
                    <span className="ds-size-selected">{selectedSize}</span>
                  </div>
                  <div className="ds-size-pills">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`ds-size-pill ${selectedSize === sz ? 'is-active' : ''}`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colorway Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="ds-option-group">
                  <div className="ds-option-header">
                    <span className="ds-option-label">COLORWAY</span>
                    <span className="ds-color-selected">{selectedColor}</span>
                  </div>
                  <div className="ds-color-pills">
                    {product.colors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        className={`ds-color-pill ${selectedColor === col ? 'is-active' : ''}`}
                        onClick={() => setSelectedColor(col)}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart Action */}
              <div className="ds-purchase-controls">
                <div className="ds-qty-selector">
                  <button
                    type="button"
                    className="ds-qty-btn"
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="ds-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="ds-qty-btn"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="ds-btn ds-add-cart-btn"
                  onClick={handleAddToCart}
                >
                  ADD TO CART <span className="ds-arrow">→</span>
                </button>
              </div>

              {/* Stock status indicator */}
              <div className="ds-stock-status">
                <span className="ds-stock-dot"></span>
                <span>
                  {product.stock > 0
                    ? `READY FOR DISPATCH // ${product.stock} IN STOCK`
                    : 'MADE TO ORDER // 2-3 WEEKS DISPATCH'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Technical Dossier & Geometry Section */}
        <section className="ds-technical-dossier">
          <div className="ds-dossier-nav">
            <button
              type="button"
              className={`ds-dossier-tab ${activeTab === 'specs' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              TECHNICAL SPECIFICATIONS
            </button>
            {product.geometry && product.geometry.length > 0 && (
              <button
                type="button"
                className={`ds-dossier-tab ${activeTab === 'geometry' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('geometry')}
              >
                FRAME GEOMETRY CHART
              </button>
            )}
          </div>

          <div className="ds-dossier-content">
            {activeTab === 'specs' && (
              <div className="ds-specs-grid">
                {product.specs ? (
                  Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="ds-spec-row">
                      <span className="ds-spec-label">
                        {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </span>
                      <span className="ds-spec-detail">{val}</span>
                    </div>
                  ))
                ) : (
                  <p className="ds-specs-none">Technical sheet available on request.</p>
                )}
              </div>
            )}

            {activeTab === 'geometry' && product.geometry && (
              <div className="ds-geometry-table-wrapper">
                <table className="ds-geometry-table">
                  <thead>
                    <tr>
                      <th>SIZE</th>
                      <th>SEAT TUBE</th>
                      <th>TOP TUBE</th>
                      <th>HEAD ANGLE</th>
                      <th>SEAT ANGLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.geometry.map((row) => (
                      <tr key={row.size}>
                        <td className="ds-geo-size">{row.size}</td>
                        <td>{row.seatTube}</td>
                        <td>{row.topTube}</td>
                        <td>{row.headAngle}</td>
                        <td>{row.seatAngle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            RIDER VERIFIED REVIEWS & RATINGS (MP3 Requirement)
            ========================================================================= */}
        <section className="ds-product-reviews-section" style={{
          marginTop: '60px',
          paddingTop: '40px',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <ReviewSection productId={product?._id} />
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;