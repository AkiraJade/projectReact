import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../actions/productActions';
import { DOSNOVENTA_CATALOG } from '../../data/dosnoventaProducts';
import ProductCard from './ProductCard';
import MetaData from '../Layout/MetaData';
import './Shop.css';

const CATEGORIES = [
  { label: 'ALL', value: 'all' },
  { label: 'BIKES', value: 'bikes' },
  { label: 'FRAMES', value: 'frames' },
  { label: 'COMPONENTS', value: 'components' },
  { label: 'APPAREL & GOODS', value: 'apparel' },
];

const SORT_OPTIONS = [
  { label: 'FEATURED / DEFAULT', value: 'featured' },
  { label: 'PRICE: LOW TO HIGH', value: 'price_asc' },
  { label: 'PRICE: HIGH TO LOW', value: 'price_desc' },
  { label: 'HIGHEST RATED', value: 'rating' },
];

const normalizeCategory = (cat) => {
  if (!cat) return 'all';
  const c = cat.toLowerCase();
  if (c.includes('bike')) return 'bikes';
  if (c.includes('frame')) return 'frames';
  if (c.includes('wheel')) return 'components'; // or components
  if (c.includes('component')) return 'components';
  if (c.includes('apparel') || c.includes('good')) return 'apparel';
  return c;
};

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const { loading, products: apiProducts } = useSelector(
    (state) => state.products || {}
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Sync category state with URL param
  const activeCategory = useMemo(() => {
    return normalizeCategory(categoryParam);
  }, [categoryParam]);

  const handleCategorySelect = (catValue) => {
    if (catValue === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catValue });
    }
  };

  useEffect(() => {
    try {
      dispatch(getProducts(1, '', [1, 100000], ''));
    } catch (e) {
      // safe fallback
    }
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Combine backend products with fallback baseline catalog
  const combinedProducts = useMemo(() => {
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      const apiIds = new Set(apiProducts.map((p) => p._id));
      const filteredCurated = DOSNOVENTA_CATALOG.filter((p) => !apiIds.has(p._id));
      return [...apiProducts, ...filteredCurated];
    }
    return DOSNOVENTA_CATALOG;
  }, [apiProducts]);

  // Filter published products by category, search, and sorting
  const filteredProducts = useMemo(() => {
    return combinedProducts
      .filter((item) => {
        // Enforce publication check (draft/unpublished products hidden from shop)
        if (item.isPublished === false) {
          return false;
        }

        // Category filter
        if (activeCategory !== 'all') {
          const itemCat = normalizeCategory(item.category);
          if (itemCat !== activeCategory) {
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
  }, [combinedProducts, activeCategory, searchQuery, sortBy]);

  return (
    <div className="ds-shop-page">
      <MetaData title="The Lineup — Dosnoventa Fixed Gear Bikes & Parts" />

      {/* Shop Masthead */}
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

      {/* In-Page Collection Filter Bar (Inside Shop page only, no second navbar) */}
      <section className="ds-shop-controls-bar">
        <div className="ds-container-wide ds-controls-inner">
          {/* Categories Selector */}
          <div className="ds-shop-categories-nav">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`ds-shop-cat-btn ${activeCategory === cat.value ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect(cat.value)}
              >
                {cat.label}
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
              SHOWING {filteredProducts.length} {filteredProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'}
              {activeCategory !== 'all' && ` IN ${CATEGORIES.find(c => c.value === activeCategory)?.label}`}
            </span>
            {(activeCategory !== 'all' || searchQuery) && (
              <button
                type="button"
                className="ds-shop-reset-btn"
                onClick={() => {
                  handleCategorySelect('all');
                  setSearchQuery('');
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
              <h3 className="ds-empty-title">NO MATCHING PRODUCTS FOUND</h3>
              <p className="ds-empty-desc">
                No products found in this category. New products added via the Admin Panel will automatically appear here once published.
              </p>
              <button
                type="button"
                className="ds-btn"
                onClick={() => {
                  handleCategorySelect('all');
                  setSearchQuery('');
                }}
              >
                VIEW ALL COLLECTIONS →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Standards Footer Banner */}
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
              Direct dispatch in custom reinforced packaging to over 80 countries worldwide.
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
