import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { STORIES_DATA } from '../../data/storiesData';
import './Stories.css';

const StoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const story = STORIES_DATA.find((s) => s.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!story) {
    return (
      <div className="ds-story-not-found ds-container">
        <MetaData title="Dispatch Not Found — Dosnoventa Journal" />
        <span className="editorial-label">ERROR 404</span>
        <h1 className="ds-not-found-title">DISPATCH NOT FOUND</h1>
        <p className="ds-not-found-desc">
          The requested journal article does not exist or has been archived.
        </p>
        <Link to="/stories" className="ds-btn">
          ← BACK TO ALL STORIES
        </Link>
      </div>
    );
  }

  // Related stories
  const relatedStories = STORIES_DATA.filter((s) =>
    story.relatedSlugs?.includes(s.slug)
  ).slice(0, 3);

  return (
    <article className="ds-story-detail-page">
      <MetaData title={`${story.title} — Dosnoventa Journal`} />

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="ds-story-top-nav">
        <div className="ds-container-wide ds-story-top-nav-inner">
          <Link to="/stories" className="ds-story-back-link">
            <span className="ds-arrow">←</span> ALL DISPATCHES
          </Link>
          <div className="ds-story-top-cat">
            <span className="editorial-label">{story.eyebrow}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="ds-story-detail-header">
        <div className="ds-container-narrow">
          <div className="ds-story-detail-meta">
            <span className="ds-story-pill">{story.category}</span>
            <span className="ds-meta-divider">•</span>
            <span className="ds-story-date-text">{story.date}</span>
            <span className="ds-meta-divider">•</span>
            <span className="ds-story-read-text">{story.readTime}</span>
          </div>

          <h1 className="ds-story-detail-title">{story.title}</h1>

          <p className="ds-story-detail-lead">{story.lead}</p>

          <div className="ds-story-byline">
            <div className="ds-byline-avatar">DSNV</div>
            <div className="ds-byline-info">
              <span className="ds-byline-author">{story.author}</span>
              <span className="ds-byline-role">{story.authorRole}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Visual Banner */}
      <div className="ds-story-hero-media">
        <div className="ds-container-wide">
          <div className="ds-story-media-box">
            <img
              src={story.heroImage}
              alt={story.title}
              className="ds-story-hero-img"
            />
            <div className="ds-story-media-credit">
              <span>DOSNOVENTA ARCHIVES / ON LOCATION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Body Content */}
      <div className="ds-story-body-section">
        <div className="ds-container-narrow">
          {/* Pull Quote */}
          {story.pullQuote && (
            <blockquote className="ds-story-pullquote">
              <span className="ds-quote-glyph">&ldquo;</span>
              <p>{story.pullQuote}</p>
            </blockquote>
          )}

          {/* Sections */}
          <div className="ds-story-sections">
            {story.sections.map((section, idx) => (
              <section key={idx} className="ds-story-section-block">
                <h2 className="ds-story-section-h2">{section.heading}</h2>
                <p className="ds-story-section-p">{section.body}</p>
              </section>
            ))}
          </div>

          {/* Stats Bar if present */}
          {story.stats && story.stats.length > 0 && (
            <div className="ds-story-stats-grid">
              {story.stats.map((stat, i) => (
                <div key={i} className="ds-story-stat-card">
                  <span className="editorial-label">{stat.label}</span>
                  <strong className="ds-story-stat-val">{stat.value}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Secondary Gallery */}
          {story.gallery && story.gallery.length > 1 && (
            <div className="ds-story-secondary-gallery">
              {story.gallery.map((imgUrl, gIdx) => (
                <div key={gIdx} className="ds-gallery-frame">
                  <img src={imgUrl} alt={`Dispatch photo ${gIdx + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {/* Post Footer CTA */}
          <div className="ds-story-post-footer">
            <div className="ds-post-tags">
              <span className="ds-tag-label">TAGS:</span>
              <span className="ds-tag-item">#FIXEDGEAR</span>
              <span className="ds-tag-item">#DOSNOVENTA</span>
              <span className="ds-tag-item">#{story.category.toUpperCase().replace(/\s+/g, '')}</span>
            </div>

            <div className="ds-post-share">
              <button
                type="button"
                className="ds-btn ds-btn-outline ds-btn-sm"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Dispatch URL copied to clipboard');
                  }
                }}
              >
                COPY DISPATCH LINK ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Stories Carousel/Grid */}
      {relatedStories.length > 0 && (
        <section className="ds-story-related-section">
          <div className="ds-container-wide">
            <div className="ds-related-header">
              <span className="editorial-label">CONTINUE READING</span>
              <h3 className="ds-related-title">RELATED DISPATCHES</h3>
            </div>

            <div className="ds-related-grid">
              {relatedStories.map((rel) => (
                <article key={rel.id} className="ds-related-card">
                  <Link to={`/stories/${rel.slug}`} className="ds-related-link">
                    <div className="ds-related-img-wrap">
                      <img src={rel.heroImage} alt={rel.title} loading="lazy" />
                      <span className="ds-related-cat">{rel.category}</span>
                    </div>
                    <div className="ds-related-content">
                      <span className="ds-related-date">{rel.date}</span>
                      <h4 className="ds-related-card-title">{rel.title}</h4>
                      <div className="ds-related-read-more">
                        <span>READ DISPATCH</span>
                        <span className="ds-arrow">→</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom Conversion CTA */}
      <section className="ds-story-shop-cta">
        <div className="ds-container">
          <span className="editorial-label">EQUIPMENT & FRAMES</span>
          <h2 className="ds-shop-cta-title">THE MACHINES THAT POWER THE STORIES.</h2>
          <p className="ds-shop-cta-desc">
            Engineered in Barcelona, hand-welded in Italy, ridden brakeless across the world.
          </p>
          <div className="ds-cta-button-group">
            <Link to="/shop" className="ds-btn">
              VIEW THE BIKES <span className="ds-arrow">→</span>
            </Link>
            <Link to="/stories" className="ds-btn ds-btn-outline">
              DISPATCH ARCHIVE
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
};

export default StoryDetail;
