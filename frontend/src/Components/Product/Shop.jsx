import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../actions/productActions';
import { DOSNOVENTA_CATALOG } from '../../data/dosnoventaProducts';
import ProductCard from './ProductCard';
import MetaData from '../Layout/MetaData';
import { Rating } from '@mui/material';
import './Shop.css';

const ITEMS_PER_PAGE = 9;

const CATEGORIES = [
  { label: 'ALL PRODUCTS', value: 'all' },
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

  const { loading, products: apiProducts } = useSelector(
    (state) => state.products || {}
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [hasReviews, setHasReviews] = useState(false);

  // Infinite scroll display limit state
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // Sync category state with URL query parameter
  const activeCategory = useMemo(() => {
    return normalizeCategory(categoryParam);
  }, [categoryParam]);

  const handleCategorySelect = (catValue) => {
    setDisplayLimit(ITEMS_PER_PAGE);
    if (catValue === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catValue });
    }
  };

  // Initial fetch products
  useEffect(() => {
    try {
      dispatch(getProducts());
    } catch (e) {}
  }, [dispatch]);

  // Combine backend products with curated catalog fallback
  const combinedProducts = useMemo(() => {
    if (apiProducts && apiProducts.length > 0) {
      const apiIds = new Set(apiProducts.map((p) => p._id));
      const filteredCurated = DOSNOVENTA_CATALOG.filter((p) => !apiIds.has(p._id));
      return [...apiProducts, ...filteredCurated];
    }
    return DOSNOVENTA_CATALOG;
  }, [apiProducts]);

  const totalPublishedCount = useMemo(() => {
    return combinedProducts.filter((item) => item.isPublished !== false).length;
  }, [combinedProducts]);

  // Filter and sort products according to requirements:
  // MP2: Price filter, Category filter, Ratings filter, Review filter
  const filteredProducts = useMemo(() => {
    return combinedProducts
      .filter((item) => {
        if (item.isPublished === false) return false;

        // 1. Category Filter
        if (activeCategory !== 'all') {
          const itemCat = normalizeCategory(item.category);
          if (itemCat !== activeCategory) return false;
        }

        // 2. In-Stock Filter
        if (inStockOnly && Number(item.stock) <= 0) return false;

        // 3. Price Filter (min / max)
        const price = Number(item.price);
        if (minPrice !== '' && price < Number(minPrice)) return false;
        if (maxPrice !== '' && price > Number(maxPrice)) return false;

        // 4. Ratings Filter (minimum stars)
        const rating = Number(item.ratings) || 0;
        if (minRating > 0 && rating < minRating) return false;

        // 5. Review Filter (only items with customer reviews)
        const reviewCount = (item.reviews && item.reviews.length) || Number(item.numOfReviews) || 0;
        if (hasReviews && reviewCount < 1) return false;

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchMat = item.material?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchMat && !matchCat) return false;
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
  }, [combinedProducts, activeCategory, searchQuery, sortBy, inStockOnly, minPrice, maxPrice, minRating, hasReviews]);

  // Visible items based on infinite scroll limit
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  const hasMore = displayLimit < filteredProducts.length;

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayLimit((prev) => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
          }, 350);
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, isLoadingMore]);

  const resetAllFilters = () => {
    handleCategorySelect('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setHasReviews(false);
    setDisplayLimit(ITEMS_PER_PAGE);
  };

  const hasActiveFilters =
    activeCategory !== 'all' ||
    searchQuery ||
    inStockOnly ||
    sortBy !== 'featured' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating > 0 ||
    hasReviews;

  return (
    <div className="ds-shop-page">
      <MetaData title="The Collection — Dosnoventa Fixed Gear Bicycles" />

      {/* =========================================================================
          BLOCK 2 (TOP): FULL-WIDTH BANNER & HEADER BAR
          ========================================================================= */}
      <section className="ds-shop-top-block">
        <div className="ds-container-wide">
          <div className="ds-shop-top-header">
            <div>
              <div className="ds-shop-masthead-meta">
                <span className="editorial-label">THE COLLECTION</span>
                <span className="ds-shop-meta-dot">•</span>
                <span className="ds-shop-published-pill">
                  {totalPublishedCount} MACHINES & GEAR
                </span>
              </div>
              <h1 className="ds-shop-main-title">BUILT FOR THE CITY</h1>
            </div>

            {/* Search & Sort Controls inside Block 2 */}
            <div className="ds-shop-top-controls">
              <div className="ds-shop-search-box">
                <span className="ds-search-icon">⌕</span>
                <input
                  type="text"
                  placeholder="SEARCH CATALOG & SPECS..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDisplayLimit(ITEMS_PER_PAGE);
                  }}
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

          {/* Active Filters Pill Bar */}
          <div className="ds-shop-active-summary">
            <span className="ds-results-count">
              SHOWING <strong>{visibleProducts.length}</strong> OF <strong>{filteredProducts.length}</strong> ITEMS
              {activeCategory !== 'all' && (
                <span className="ds-active-pill">
                  {CATEGORIES.find((c) => c.value === activeCategory)?.label}
                </span>
              )}
              {inStockOnly && <span className="ds-active-pill">IN STOCK ONLY</span>}
              {minPrice && <span className="ds-active-pill">MIN ${minPrice}</span>}
              {maxPrice && <span className="ds-active-pill">MAX ${maxPrice}</span>}
              {minRating > 0 && <span className="ds-active-pill">★ {minRating}+</span>}
              {hasReviews && <span className="ds-active-pill">WITH REVIEWS</span>}
            </span>

            {hasActiveFilters && (
              <button type="button" className="ds-shop-reset-btn" onClick={resetAllFilters}>
                CLEAR ALL FILTERS ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN LAYOUT: BLOCK 1 (LEFT SIDEBAR) & BLOCK 3 (RIGHT PRODUCTS GRID)
          ========================================================================= */}
      <section className="ds-shop-main-layout">
        <div className="ds-container-wide ds-shop-split-wrapper">
          {/* =====================================================================
              BLOCK 1 (LEFT): FILTER SIDEBAR
              ===================================================================== */}
          <aside className="ds-shop-sidebar" aria-label="Filters">
            <div className="ds-sidebar-card">
              <div className="ds-sidebar-header">
                <h3 className="ds-sidebar-title">FILTERS</h3>
                {hasActiveFilters && (
                  <button type="button" className="ds-sidebar-reset-link" onClick={resetAllFilters}>
                    Reset
                  </button>
                )}
              </div>

              {/* 1. CATEGORY FILTER (MP2: 5pts) */}
              <div className="ds-filter-group">
                <span className="ds-filter-heading">CATEGORIES</span>
                <div className="ds-category-list">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`ds-category-item-btn ${activeCategory === cat.value ? 'is-active' : ''}`}
                      onClick={() => handleCategorySelect(cat.value)}
                    >
                      <span>{cat.label}</span>
                      {activeCategory === cat.value && <span className="ds-cat-indicator">●</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. PRICE FILTER (MP2: 5pts) */}
              <div className="ds-filter-group">
                <span className="ds-filter-heading">PRICE RANGE ($)</span>
                <div className="ds-price-inputs-row">
                  <div className="ds-price-field">
                    <span className="ds-price-cur">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setDisplayLimit(ITEMS_PER_PAGE);
                      }}
                      className="ds-price-num-input"
                      aria-label="Min price"
                    />
                  </div>
                  <span className="ds-price-sep">–</span>
                  <div className="ds-price-field">
                    <span className="ds-price-cur">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setDisplayLimit(ITEMS_PER_PAGE);
                      }}
                      className="ds-price-num-input"
                      aria-label="Max price"
                    />
                  </div>
                </div>

                {/* Quick Price Buttons */}
                <div className="ds-price-quick-tags">
                  <button
                    type="button"
                    className="ds-quick-tag"
                    onClick={() => { setMinPrice('0'); setMaxPrice('500'); setDisplayLimit(ITEMS_PER_PAGE); }}
                  >
                    &lt; $500
                  </button>
                  <button
                    type="button"
                    className="ds-quick-tag"
                    onClick={() => { setMinPrice('500'); setMaxPrice('1500'); setDisplayLimit(ITEMS_PER_PAGE); }}
                  >
                    $500–$1.5k
                  </button>
                  <button
                    type="button"
                    className="ds-quick-tag"
                    onClick={() => { setMinPrice('1500'); setMaxPrice(''); setDisplayLimit(ITEMS_PER_PAGE); }}
                  >
                    $1.5k+
                  </button>
                </div>
              </div>

              {/* 3. RATINGS FILTER (MP2: 5pts) */}
              <div className="ds-filter-group">
                <span className="ds-filter-heading">CUSTOMER RATINGS</span>
                <div className="ds-rating-options">
                  {[
                    { stars: 5, label: '5.0 Stars' },
                    { stars: 4, label: '4.0 & Up' },
                    { stars: 3, label: '3.0 & Up' },
                    { stars: 2, label: '2.0 & Up' },
                  ].map((r) => (
                    <button
                      key={r.stars}
                      type="button"
                      className={`ds-rating-btn ${minRating === r.stars ? 'is-active' : ''}`}
                      onClick={() => {
                        setMinRating(minRating === r.stars ? 0 : r.stars);
                        setDisplayLimit(ITEMS_PER_PAGE);
                      }}
                    >
                      <Rating value={r.stars} readOnly size="small" sx={{ color: '#C83226' }} />
                      <span className="ds-rating-txt">{r.label}</span>
                    </button>
                  ))}
                  {minRating > 0 && (
                    <button
                      type="button"
                      className="ds-rating-clear-btn"
                      onClick={() => { setMinRating(0); setDisplayLimit(ITEMS_PER_PAGE); }}
                    >
                      All ratings
                    </button>
                  )}
                </div>
              </div>

              {/* 4. REVIEW FILTER (MP2: 5pts) */}
              <div className="ds-filter-group">
                <span className="ds-filter-heading">REVIEWS & FEEDBACK</span>
                <label className="ds-sidebar-checkbox-label" htmlFor="reviews-checkbox">
                  <input
                    id="reviews-checkbox"
                    type="checkbox"
                    checked={hasReviews}
                    onChange={(e) => {
                      setHasReviews(e.target.checked);
                      setDisplayLimit(ITEMS_PER_PAGE);
                    }}
                    className="ds-custom-checkbox"
                  />
                  <span>Has Customer Reviews Only</span>
                </label>
              </div>

              {/* 5. AVAILABILITY */}
              <div className="ds-filter-group">
                <span className="ds-filter-heading">AVAILABILITY</span>
                <label className="ds-sidebar-checkbox-label" htmlFor="stock-checkbox">
                  <input
                    id="stock-checkbox"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setDisplayLimit(ITEMS_PER_PAGE);
                    }}
                    className="ds-custom-checkbox"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* =====================================================================
              BLOCK 3 (RIGHT): PRODUCTS GRID & INFINITE SCROLL
              ===================================================================== */}
          <main className="ds-shop-products-column">
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
            ) : visibleProducts.length > 0 ? (
              <>
                <div className="ds-shop-grid-cards">
                  {visibleProducts.map((item) => (
                    <ProductCard key={item._id} product={item} />
                  ))}
                </div>

                {/* INFINITE SCROLL SENTINEL & INDICATOR (Quiz 3: 15pts) */}
                <div
                  ref={sentinelRef}
                  className="ds-infinite-sentinel-box"
                >
                  {isLoadingMore ? (
                    <div className="ds-infinite-loading">
                      <div className="ds-spinner-dot" />
                      <span>LOADING MORE MACHINES...</span>
                    </div>
                  ) : hasMore ? (
                    <span className="ds-infinite-hint">
                      SCROLL DOWN TO LOAD MORE ({visibleProducts.length} OF {filteredProducts.length})
                    </span>
                  ) : (
                    <span className="ds-infinite-end">
                      — END OF DOSNOVENTA COLLECTION —
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="ds-shop-empty-state">
                <span className="ds-empty-icon">∅</span>
                <h3 className="ds-empty-title">NO MATCHING PRODUCTS FOUND</h3>
                <p className="ds-empty-desc">
                  No items match your active filters. Try adjusting your search, price range, or rating.
                </p>
                <button type="button" className="ds-btn" onClick={resetAllFilters}>
                  CLEAR FILTERS & VIEW ALL →
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* BRAND STANDARDS FOOTER BANNER */}
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
              Every custom machine is hand-aligned, faced, and pre-inspected by experienced track mechanics
              before boxing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
