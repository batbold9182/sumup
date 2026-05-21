import type { Salon } from '../types';

interface Props {
  salon: Salon;
  onClick: () => void;
}

function Stars({ rating }: { rating?: number }) {
  if (rating === undefined) return <span className="no-rating">No rating</span>;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars" title={`${rating} out of 5`}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
    </span>
  );
}

export function SalonCard({ salon, onClick }: Props) {
  return (
    <div className="salon-card" onClick={onClick}>
      <div className="card-header">
        <h3 className="card-name">{salon.name}</h3>
        {salon.priceLevel && <span className="price-badge">{salon.priceLevel}</span>}
      </div>
      <div className="card-rating">
        <Stars rating={salon.rating} />
        {salon.rating !== undefined && (
          <span className="rating-value">{salon.rating.toFixed(1)}</span>
        )}
        {salon.totalRatings !== undefined && (
          <span className="rating-count">({salon.totalRatings.toLocaleString()})</span>
        )}
      </div>
      <p className="card-address">{salon.address || 'Address not available'}</p>
      {salon.district && <span className="card-district">{salon.district}</span>}
    </div>
  );
}
