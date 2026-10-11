import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onQuickAdd }) => {
  if (!product) return null;

  const mainImage = product.images?.[0]?.url || '/images/Dosnoventa_company_x.webp';
  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(product.price);

  return (
    <div className="ds-product-card">
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
            {product.stock <= 5 && product.stock > 0 && (
              <span className="ds-card-stock-tag">LIMITED STOCK</span>
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
            INSPECT <span className="ds-card-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
