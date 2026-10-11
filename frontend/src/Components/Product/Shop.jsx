import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../actions/productActions';
import { DOSNOVENTA_CATALOG } from '../../data/dosnoventaProducts';
import ProductCard from './ProductCard';
import MetaData from '../Layout/MetaData';
import './Shop.css';

const CATEGORIES = [
  'ALL',
  'COMPLETE BIKES',
  'FRAMES & FORKS',
  'WHEELSETS',
  'COMPONENTS',
];

const SORT_OPTIONS = [
  { label: 'FEATURED / DEFAULT', value: 'featured' },
  { label: 'PRICE: LOW TO HIGH', value: 'price_asc' },
  { label: 'PRICE: HIGH TO LOW', value: 'price_desc' },
  { label: 'HIGHEST RATED', value: 'rating' },
];

const Shop = () => {
  const dispatch = useDispatch();
  const { loading, products: apiProducts } = useSelector(
    (state) => state.products || {}
  );

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    // Attempt backend fetch via redux
    try {
      dispatch(getProducts(1, '', [1, 10000], ''));
    } catch (e) {
      // safe fallback
    }
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Combine backend products if available with curated Dosnoventa inventory
  const combinedProducts = useMemo(() => {
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      // Merge unique by _id
      const apiIds = new Set(apiProducts.map((p) => p._id));
      const filteredCurated = DOSNOVENTA_CATALOG.filter((p) => !apiIds.has(p._id));
      return [...apiProducts, ...filteredCurated];
    }
    return DOSNOVENTA_CATALOG;
  }, [apiProducts]);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return combinedProducts
      .filter((item) => {
        // Category check
        if (activeCategory !== 'ALL') {
          const itemCat = item.category?.toUpperCase() || '';
          const targetCat = activeCategory.toUpperCase();
          if (!itemCat.includes(targetCat.replace('&', '').replace('S', '')) && itemCat !== targetCat) {
            return false;
          }
        }

        // Material check
        if (selectedMaterial !== 'ALL') {
          const itemMat = (item.material || '').toUpperCase();
          if (!itemMat.includes(selectedMaterial.toUpperCase())) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchMat = item.material?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchMat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.ratings || 0) - (a.ratings || 0);
        return 0;
      });
  }, [combinedProducts, activeCategory, selectedMaterial, searchQuery, sortBy]);

  return (
    <div className="ds-shop-page">
      <MetaData title="The Lineup — Dosnoventa Fixed Gear Bikes & Parts" />

      {/* Shop Masthead / Header */}
      <section className="ds-shop-masthead">
        <div className="ds-container-wide">
          <div className="ds-shop-masthead-content">
            <span className="editorial-label">ATELIER CATALOG 2026</span>
            <h1 className="ds-shop-title">THE LINEUP</h1>
            <p className="ds-shop-subtitle">
              Precision geometries, handmade Italian Columbus steel, high-modulus carbon monocoques,
              and ruthless track components. Engineered without compromise.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="ds-shop-controls-bar">
        <div className="ds-container-wide ds-controls-inner">
          {/* Categories Horizontal Selector */}
          <div className="ds-shop-categories-nav">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`ds-shop-cat-btn ${activeCategory === cat ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Row */}
          <div className="ds-shop-filter-inputs">
            {/* Search Box */}
            <div className="ds-shop-search-box">
              <span className="ds-search-icon">⌕</span>
              <input
                type="text"
                placeholder="SEARCH MODELS & SPECS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ds-shop-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ds-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="ds-shop-sort-box">
              <label htmlFor="ds-sort-select" className="ds-sort-label">
                SORT:
              </label>
              <select
                id="ds-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ds-shop-sort-select"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="ds-shop-grid-section">
        <div className="ds-container-wide">
          <div className="ds-shop-results-meta">
            <span className="ds-results-count">
              SHOWING {filteredProducts.length} {filteredProducts.length === 1 ? 'BUILD' : 'BUILDS & COMPONENTS'}
            </span>
            {(activeCategory !== 'ALL' || searchQuery || selectedMaterial !== 'ALL') && (
              <button
                type="button"
                className="ds-shop-reset-btn"
                onClick={() => {
                  setActiveCategory('ALL');
                  setSearchQuery('');
                  setSelectedMaterial('ALL');
                  setSortBy('featured');
                }}
              >
                RESET FILTERS ✕
              </button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="ds-shop-product-grid">
              {filteredProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          ) : (
            <div className="ds-shop-empty-state">
              <span className="ds-empty-icon">∅</span>
              <h3 className="ds-empty-title">NO MATCHING BUILDS FOUND</h3>
              <p className="ds-empty-desc">
                No machines found matching "{searchQuery}". Try adjusting your filters or search keywords.
              </p>
              <button
                type="button"
                className="ds-btn"
                onClick={() => {
                  setActiveCategory('ALL');
                  setSearchQuery('');
                }}
              >
                VIEW FULL COLLECTION →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Brand Standards Footer Banner */}
      <section className="ds-shop-standards-banner">
        <div className="ds-container-wide ds-standards-grid">
          <div className="ds-standard-item">
            <span className="ds-standard-number">01</span>
            <h4 className="ds-standard-title">LIFETIME WARRANTY</h4>
            <p className="ds-standard-desc">
              Every steel and aluminum Dosnoventa frameset is backed by our full lifetime warranty against manufacturing defects.
            </p>
          </div>

          <div className="ds-standard-item">
            <span className="ds-standard-number">02</span>
            <h4 className="ds-standard-title">GLOBAL INSURED FREIGHT</h4>
            <p className="ds-standard-desc">
              Direct dispatch in custom reinforced reinforced packaging to over 80 countries worldwide.
            </p>
          </div>

          <div className="ds-standard-item">
            <span className="ds-standard-number">03</span>
            <h4 className="ds-standard-title">BARCELONA ATELIER</h4>
            <p className="ds-standard-desc">
              Every custom build is inspected, prepped, and hand-tuned by experienced track mechanics before departure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
