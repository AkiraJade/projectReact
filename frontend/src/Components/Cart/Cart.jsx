import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import './Cart.css';

const Cart = ({ addItemToCart, removeItemFromCart, cartItems = [] }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const increaseQty = (id, quantity, stock) => {
    const newQty = quantity + 1;
    if (newQty > stock) return;
    addItemToCart(id, newQty);
  };

  const decreaseQty = (id, quantity) => {
    const newQty = quantity - 1;
    if (newQty <= 0) return;
    addItemToCart(id, newQty);
  };

  const removeCartItemHandler = (id) => {
    removeItemFromCart(id);
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const itemsCount = cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0);
  const itemsSubtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.quantity || 1) * Number(item.price || 0),
    0
  );

  // Free insured shipping for orders over €500
  const isFreeShipping = itemsSubtotal >= 500 || itemsSubtotal === 0;
  const estimatedShipping = isFreeShipping ? 0 : 45;
  const estimatedTax = Number((itemsSubtotal * 0.19).toFixed(2)); // Standard 19% VAT rate
  const finalTotal = itemsSubtotal + estimatedShipping;

  const formatPrice = (val) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="ds-cart-page">
      <MetaData title="Shopping Cart — Dosnoventa" />

      {/* Editorial Header */}
      <section className="ds-cart-header-section">
        <div className="ds-container-wide">
          <span className="editorial-label">YOUR SELECTION</span>
          <h1 className="ds-cart-page-title">THE CART</h1>
        </div>
      </section>

      <main className="ds-cart-main-section">
        <div className="ds-container-wide">
          {cartItems.length === 0 ? (
            /* =========================================================================
               EMPTY CART STATE
               ========================================================================= */
            <div className="ds-cart-empty-state">
              <span className="ds-cart-empty-icon">∅</span>
              <h2 className="ds-cart-empty-title">NOTHING IN THE CART. YET.</h2>
              <p className="ds-cart-empty-sub">
                Explore the collection to find your next machine, frameset, or precision component.
              </p>
              <Link to="/shop" className="ds-btn ds-cart-empty-cta">
                EXPLORE THE COLLECTION <span className="ds-arrow">→</span>
              </Link>
            </div>
          ) : (
            /* =========================================================================
               2-COLUMN EDITORIAL CART LAYOUT
               ========================================================================= */
            <div className="ds-cart-layout-grid">
              {/* LEFT COLUMN: ITEM LIST */}
              <div className="ds-cart-items-column">
                <div className="ds-cart-items-meta-bar">
                  <span className="ds-items-count-label">
                    {itemsCount} {itemsCount === 1 ? 'UNIT' : 'UNITS'} IN SELECTION
                  </span>
                  <Link to="/shop" className="ds-continue-shopping-link">
                    CONTINUE BROWSING ↗
                  </Link>
                </div>

                <div className="ds-cart-items-list">
                  {cartItems.map((item) => {
                    const itemTotalPrice = Number(item.price) * Number(item.quantity);
                    const isMaxStock = item.quantity >= item.stock;

                    return (
                      <article key={item.product} className="ds-cart-item-row">
                        {/* Media Thumbnail */}
                        <div className="ds-cart-thumb-box">
                          <Link to={`/product/${item.product}`}>
                            <img
                              src={item.image || '/images/Dosnoventa_company_x.webp'}
                              alt={item.name}
                              className="ds-cart-thumb-img"
                            />
                          </Link>
                        </div>

                        {/* Item Details */}
                        <div className="ds-cart-item-info">
                          <div className="ds-cart-item-header">
                            <h3 className="ds-cart-item-title">
                              <Link to={`/product/${item.product}`}>{item.name}</Link>
                            </h3>
                            <button
                              type="button"
                              className="ds-cart-remove-btn"
                              onClick={() => removeCartItemHandler(item.product)}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              ✕ REMOVE
                            </button>
                          </div>

                          <div className="ds-cart-item-specs">
                            <span className="ds-cart-spec-label">
                              SPEC: {item.size || 'STANDARD TRACK SPEC'}
                            </span>
                            <span className="ds-cart-stock-notice">
                              {item.stock > 0 ? `${item.stock} AVAILABLE IN ATELIER` : 'LOW STOCK'}
                            </span>
                          </div>

                          {/* Price, Stepper & Subtotal Row */}
                          <div className="ds-cart-stepper-price-row">
                            <div className="ds-cart-unit-price">
                              <span className="ds-unit-price-label">UNIT PRICE:</span>
                              <strong>{formatPrice(item.price)}</strong>
                            </div>

                            {/* Quantity Stepper */}
                            <div className="ds-cart-stepper-container">
                              <button
                                type="button"
                                className="ds-stepper-btn ds-stepper-minus"
                                onClick={() => decreaseQty(item.product, item.quantity)}
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="ds-stepper-val">{item.quantity}</span>
                              <button
                                type="button"
                                className="ds-stepper-btn ds-stepper-plus"
                                onClick={() => increaseQty(item.product, item.quantity, item.stock)}
                                disabled={isMaxStock}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Item Subtotal */}
                            <div className="ds-cart-item-subtotal">
                              <span className="ds-subtotal-label">SUBTOTAL:</span>
                              <span className="ds-subtotal-val">{formatPrice(itemTotalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
              <aside className="ds-cart-summary-column">
                <div className="ds-cart-summary-card">
                  <h2 className="ds-summary-title">ORDER SUMMARY</h2>

                  <div className="ds-summary-rows">
                    <div className="ds-summary-row">
                      <span className="ds-summary-label">ITEMS SUBTOTAL</span>
                      <span className="ds-summary-value">{formatPrice(itemsSubtotal)}</span>
                    </div>

                    <div className="ds-summary-row">
                      <span className="ds-summary-label">ESTIMATED FREIGHT</span>
                      <span className="ds-summary-value">
                        {isFreeShipping ? (
                          <span className="ds-free-badge">COMPLIMENTARY</span>
                        ) : (
                          formatPrice(estimatedShipping)
                        )}
                      </span>
                    </div>

                    <div className="ds-summary-row">
                      <span className="ds-summary-label">ESTIMATED VAT / TAX</span>
                      <span className="ds-summary-value">{formatPrice(estimatedTax)}</span>
                    </div>

                    <div className="ds-summary-divider" />

                    <div className="ds-summary-row ds-summary-total-row">
                      <span className="ds-total-label">TOTAL ESTIMATE</span>
                      <strong className="ds-total-value">{formatPrice(finalTotal)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="ds-btn ds-checkout-btn"
                    onClick={checkoutHandler}
                  >
                    PROCEED TO CHECKOUT <span className="ds-arrow">→</span>
                  </button>

                  <div className="ds-summary-perks">
                    <div className="ds-perk-item">
                      <span className="ds-perk-icon">✓</span>
                      <span>LIFETIME METALLURGICAL FRAME WARRANTY</span>
                    </div>
                    <div className="ds-perk-item">
                      <span className="ds-perk-icon">✓</span>
                      <span>GLOBAL HEAVY-DUTY CARTON CRATE DISPATCH</span>
                    </div>
                    <div className="ds-perk-item">
                      <span className="ds-perk-icon">✓</span>
                      <span>HAND-CHECKED &amp; ALIGNED BEFORE DISPATCH</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;