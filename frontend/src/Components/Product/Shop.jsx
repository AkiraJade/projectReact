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
  { label: 'NEWEST RELEASES', value: 'newest' },
  { label: 'HIGHEST RATED', value: 'rating' },
];

const normalizeCategory = (cat) => {
  if (!cat) return 'all';
  const c = cat.toLowerCase();
  if (c.includes('bike')) return 'bikes';
  if (c.includes('frame')) return 'frames';
  if (c.includes('wheel') || c.includes('component')) return 'components';
  if (c.includes('apparel') || c.includes('good')) return 'apparel';
  return c;
};

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const { loading, products: apiProducts, productsCount } = useSelector(
    (state) => state.products || {}
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync category state with URL query parameter
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

  // Combine backend products with curated catalog fallback
  const combinedProducts = useMemo(() => {
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      const apiIds = new Set(apiProducts.map((p) => p._id));
      const filteredCurated = DOSNOVENTA_CATALOG.filter((p) => !apiIds.has(p._id));
      return [...apiProducts, ...filteredCurated];
    }
    return DOSNOVENTA_CATALOG;
  }, [apiProducts]);

  // Total published products
  const totalPublishedCount = useMemo(() => {
    return combinedProducts.filter((item) => item.isPublished !== false).length;
  }, [combinedProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return combinedProducts
      .filter((item) => {
        // Only published products
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

        // In-stock toggle
        if (inStockOnly && Number(item.stock) <= 0) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchMat = item.material?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchMat && !matchCat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.ratings || 0) - (a.ratings || 0);
        if (sortBy === 'newest') {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });
  }, [combinedProducts, activeCategory, searchQuery, sortBy, inStockOnly]);

  return (
    <div className="ds-shop-page">
      <MetaData title="The Collection — Dosnoventa Fixed Gear Bicycles" />

      {/* =========================================================================
          1. EDITORIAL INTRODUCTION (Restrained, high-impact masthead)
          ========================================================================= */}
      <section className="ds-shop-masthead">
        <div className="ds-container-wide">
          <div className="ds-shop-masthead-content">
            <div className="ds-shop-masthead-meta">
              <span className="editorial-label">THE COLLECTION</span>
              <span className="ds-shop-meta-dot">•</span>
              <span className="ds-shop-published-pill">
                {totalPublishedCount} PUBLISHED MACHINES &amp; GEAR
              </span>
            </div>

            <h1 className="ds-shop-title">BUILT FOR THE CITY.</h1>

            <p className="ds-shop-subtitle">
              Precision fixed-gear bicycles, handmade Italian Columbus steel framesets,
              aerospace-grade Toray carbon monocoques, and ruthless street riding equipment.
              Engineered for velocity without compromise.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. IN-PAGE CATEGORY BROWSING & CATALOG TOOLBAR
          ========================================================================= */}
      <section className="ds-shop-controls-bar">
        <div className="ds-container-wide ds-controls-inner">
          {/* Category Tabs (Segmented control within page, not a second navbar) */}
          <div className="ds-shop-categories-nav" role="tablist" aria-label="Product Categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.value}
                className={`ds-shop-cat-btn ${activeCategory === cat.value ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search, Filter & Sort Controls */}
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
                aria-label="Search catalog products"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ds-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* In-Stock Only Toggle */}
            <label className="ds-shop-stock-toggle" htmlFor="stock-toggle">
              <input
                id="stock-toggle"
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="ds-stock-checkbox"
              />
              <span className="ds-stock-toggle-label">IN STOCK ONLY</span>
            </label>

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
                aria-label="Sort products"
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

      {/* =========================================================================
          3. PRODUCT CATALOG GRID
          ========================================================================= */}
      <main className="ds-shop-grid-section">
        <div className="ds-container-wide">
          <div className="ds-shop-results-meta">
            <span className="ds-results-count">
              SHOWING {filteredProducts.length} OF {totalPublishedCount} PRODUCTS
              {activeCategory !== 'all' && ` IN ${CATEGORIES.find((c) => c.value === activeCategory)?.label}`}
              {inStockOnly && ' (IN STOCK)'}
            </span>

            {(activeCategory !== 'all' || searchQuery || inStockOnly || sortBy !== 'featured') && (
              <button
                type="button"
                className="ds-shop-reset-btn"
                onClick={() => {
                  handleCategorySelect('all');
                  setSearchQuery('');
                  setSortBy('featured');
                  setInStockOnly(false);
                }}
              >
                RESET FILTERS ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="ds-shop-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div key={sk} className="ds-skeleton-card">
                  <div className="ds-skeleton-image"></div>
                  <div className="ds-skeleton-bar ds-sk-title"></div>
                  <div className="ds-skeleton-bar ds-sk-sub"></div>
                  <div className="ds-skeleton-bar ds-sk-price"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
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
                No items match your active filters. Try adjusting your search query,
                selecting &ldquo;ALL&rdquo; categories, or clearing the in-stock filter.
              </p>
              <button
                type="button"
                className="ds-btn"
                onClick={() => {
                  handleCategorySelect('all');
                  setSearchQuery('');
                  setSortBy('featured');
                  setInStockOnly(false);
                }}
              >
                VIEW ENTIRE COLLECTION →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          4. BRAND STANDARDS FOOTER BANNER
          ========================================================================= */}
      <section className="ds-shop-standards-banner">
        <div className="ds-container-wide ds-standards-grid">
          <div className="ds-standard-item">
            <span className="ds-standard-number">01</span>
            <h4 className="ds-standard-title">LIFETIME FRAME WARRANTY</h4>
            <p className="ds-standard-desc">
              Every steel and aluminum Dosnoventa frameset is backed by our full warranty against
              metallurgical manufacturing defects.
            </p>
          </div>

          <div className="ds-standard-item">
            <span className="ds-standard-number">02</span>
            <h4 className="ds-standard-title">GLOBAL INSURED FREIGHT</h4>
            <p className="ds-standard-desc">
              Direct dispatch in reinforced heavy-duty bike cartons to over 80 countries worldwide.
            </p>
          </div>

          <div className="ds-standard-item">
            <span className="ds-standard-number">03</span>
            <h4 className="ds-standard-title">BARCELONA ATELIER TUNING</h4>
            <p className="ds-standard-desc">
              Every custom machine is hand-aligned, faced, and pre-inspected by experienced track
              mechanics before boxing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
