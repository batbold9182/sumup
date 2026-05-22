import type { Salon } from '../types';

const PRICE_DISPLAY: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE:    '$',
  PRICE_LEVEL_MODERATE:       '$$',
  PRICE_LEVEL_EXPENSIVE:      '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

function formatPrice(raw: string): string {
  return PRICE_DISPLAY[raw] ?? raw;
}

const GRADIENTS: [string, string][] = [
  ['#3b0764', '#6b21a8'],
  ['#172554', '#1e40af'],
  ['#052e16', '#166534'],
  ['#4c0519', '#9f1239'],
  ['#431407', '#9a3412'],
  ['#0c4a6e', '#075985'],
  ['#1e1b4b', '#3730a3'],
  ['#14532d', '#166534'],
  ['#450a0a', '#991b1b'],
  ['#0f172a', '#1e3a5f'],
  ['#2e1065', '#4c1d95'],
  ['#1a0533', '#5b21b6'],
];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = Math.imul(31, h) + name.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function Stars({ rating }: { rating?: number }) {
  if (rating === undefined) return <span className="no-rating">No reviews yet</span>;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const diff = rating - (i - 1);
    if (diff >= 1)        stars.push(<span key={i} className="star star-full">★</span>);
    else if (diff >= 0.5) stars.push(<span key={i} className="star star-half">★</span>);
    else                  stars.push(<span key={i} className="star star-empty">★</span>);
  }
  return <div className="star-row">{stars}</div>;
}

export function SalonCard({ salon, onClick }: { salon: Salon; onClick: () => void }) {
  const [from, to] = GRADIENTS[nameHash(salon.name) % GRADIENTS.length];

  return (
    <div
      className="salon-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div
        className="card-banner"
        style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      >
        <span className="banner-initial">{salon.name.charAt(0).toUpperCase()}</span>
      </div>

      <div className="card-body">
        <div className="card-title-row">
          <h3 className="card-name">{salon.name}</h3>
          {salon.priceLevel && <span className="price-tag">{formatPrice(salon.priceLevel)}</span>}
        </div>

        <div className="card-rating-row">
          <Stars rating={salon.rating} />
          {salon.rating !== undefined && (
            <span className="rating-num">{salon.rating.toFixed(1)}</span>
          )}
          {salon.totalRatings !== undefined && (
            <span className="rating-count">({salon.totalRatings.toLocaleString()})</span>
          )}
        </div>

        {salon.address && (
          <div className="card-address-row">
            <svg className="pin-icon" width="11" height="11" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="card-address-text">{salon.address}</p>
          </div>
        )}

        {salon.district && <span className="district-chip">{salon.district}</span>}
      </div>
    </div>
  );
}
