import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const mainImage = product.images?.[0]?.url || '/images/Dosnoventa_company_x.webp';
  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(product.price) || 0);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className={`ds-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}>
      <Link to={`/product/${product._id}`} className="ds-card-media-link">
        <div className="ds-card-media-wrapper">
          <img
            src={mainImage}
            alt={product.name}
            className="ds-card-image"
            loading="lazy"
          />
          <div className="ds-card-badge-row">
            <span className="ds-card-category-tag">{product.category}</span>
            {isOutOfStock ? (
              <span className="ds-card-stock-tag ds-stock-soldout">SOLD OUT</span>
            ) : isLowStock ? (
              <span className="ds-card-stock-tag ds-stock-low">LOW STOCK ({product.stock} LEFT)</span>
            ) : (
              <span className="ds-card-stock-tag ds-stock-available">IN STOCK</span>
            )}
          </div>
        </div>
      </Link>

      <div className="ds-card-content">
        <div className="ds-card-meta-top">
          <span className="ds-card-material">{product.material || 'ATELIER FINISH'}</span>
          <span className="ds-card-rating">★ {product.ratings || '5.0'}</span>
        </div>

        <h3 className="ds-card-title">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        {product.tagline && <p className="ds-card-tagline">{product.tagline}</p>}

        <div className="ds-card-footer">
          <div className="ds-card-price-block">
            <span className="ds-card-price-label">PRICE</span>
            <span className="ds-card-price">{formattedPrice}</span>
          </div>

          <Link to={`/product/${product._id}`} className="ds-card-inspect-btn">
            {isOutOfStock ? 'VIEW ARCHIVE' : 'INSPECT'} <span className="ds-card-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
