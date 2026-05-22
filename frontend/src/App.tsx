import { useState, useEffect, useCallback } from 'react';
import type { Salon, PaginationMeta } from './types';
import { getSalons, searchSalons, getDistricts } from './api';
import { SalonCard } from './components/SalonCard';
import { SalonModal } from './components/SalonModal';
import { AddSalonModal } from './components/AddSalonModal';
import './App.css';

function SearchIcon() {
  return (
    <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="filter-chip">
      {label}
      <button className="chip-remove" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="salon-card sk-card" aria-hidden="true">
      <div className="card-banner sk-banner" />
      <div className="card-body">
        <div className="sk-line" style={{ width: '68%',  height: 17, marginBottom: 8 }} />
        <div className="sk-line" style={{ width: '44%',  height: 13, marginBottom: 10 }} />
        <div className="sk-line" style={{ width: '88%',  height: 12, marginBottom: 4 }} />
        <div className="sk-line" style={{ width: '60%',  height: 12, marginBottom: 12 }} />
        <div className="sk-line" style={{ width: '36%',  height: 20, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function App() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [priceFilter, setPriceFilter] = useState('');
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDistricts().then(setDistricts).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchSalons = async () => {
      setLoading(true);
      setError(null);
      try {
        let result;
        if (debouncedQuery || minRating > 0 || district) {
          result = await searchSalons(debouncedQuery, minRating, district, page);
        } else {
          result = await getSalons(page);
        }
        const { data, ...pageMeta } = result;
        setSalons(data);
        setMeta(pageMeta);
      } catch {
        setError('Failed to load salons. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchSalons();
  }, [debouncedQuery, minRating, page, district]);

  const filteredSalons = priceFilter
    ? salons.filter(s => s.priceLevel === priceFilter)
    : salons;

  const [showAddModal, setShowAddModal] = useState(false);

  const handleSalonUpdate = useCallback((updated: Salon) => {
    setSalons(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelectedSalon(updated);
  }, []);

  const handleSalonAdd = useCallback((salon: Salon) => {
    setSalons(prev => [salon, ...prev]);
    setMeta(prev => prev ? { ...prev, totalItems: prev.totalItems + 1 } : prev);
  }, []);

  const handleSalonDelete = useCallback((id: string) => {
    setSalons(prev => prev.filter(s => s.id !== id));
    setMeta(prev => prev ? { ...prev, totalItems: prev.totalItems - 1 } : prev);
    setSelectedSalon(null);
  }, []);

  const clearFilters = () => {
    setQuery('');
    setMinRating(0);
    setPriceFilter('');
    setDistrict('');
    setPage(1);
  };

  const hasFilters = query || minRating > 0 || priceFilter || district;
  const displayCount = meta
    ? priceFilter ? filteredSalons.length : meta.totalItems
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 0 1 9 9c0 4.97-9 13-9 13S3 15.97 3 11a9 9 0 0 1 9-9z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <div className="brand-text">
            <h1>Warsaw Beauty</h1>
            <p className="subtitle">Discover the best beauty salons across Warsaw</p>
          </div>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add salon
        </button>
      </header>

      <div className="filters-section">
        <div className="filters">
          <div className="search-wrapper">
            <SearchIcon />
            <input
              className="search-input"
              type="search"
              placeholder="Search salons…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={minRating}
            onChange={e => { setMinRating(Number(e.target.value)); setPage(1); }}
          >
            <option value={0}>Any rating</option>
            <option value={3}>3+ stars</option>
            <option value={3.5}>3.5+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={4.5}>4.5+ stars</option>
          </select>
          <select
            className="filter-select"
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
          >
            <option value="">Any price</option>
            <option value="PRICE_LEVEL_INEXPENSIVE">$ · Budget</option>
            <option value="PRICE_LEVEL_MODERATE">$$ · Mid-range</option>
            <option value="PRICE_LEVEL_EXPENSIVE">$$$ · Premium</option>
            <option value="PRICE_LEVEL_VERY_EXPENSIVE">$$$$ · Luxury</option>
          </select>
          <select
            className="filter-select"
            value={district}
            onChange={e => { setDistrict(e.target.value); setPage(1); }}
          >
            <option value="">Any district</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {hasFilters && (
          <div className="active-filters">
            {query && (
              <FilterChip label={`"${query}"`} onRemove={() => setQuery('')} />
            )}
            {minRating > 0 && (
              <FilterChip label={`${minRating}+ ★`} onRemove={() => { setMinRating(0); setPage(1); }} />
            )}
            {priceFilter && (
              <FilterChip label={priceFilter} onRemove={() => setPriceFilter('')} />
            )}
            {district && (
              <FilterChip label={district} onRemove={() => { setDistrict(''); setPage(1); }} />
            )}
            <button className="clear-all-btn" onClick={clearFilters}>Clear all</button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <>
          <div className="sk-count" style={{ width: 130 }} />
          <div className="salons-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : (
        <>
          {displayCount !== null && (
            <p className="results-count">
              <strong>{displayCount.toLocaleString()}</strong>{' '}
              {displayCount === 1 ? 'salon' : 'salons'} found
            </p>
          )}

          {filteredSalons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <p className="empty-title">No salons found</p>
              <p className="empty-sub">Try adjusting your filters or search term</p>
              {hasFilters && (
                <button className="btn-primary" onClick={clearFilters} style={{ marginTop: 16 }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="salons-grid">
              {filteredSalons.map(salon => (
                <SalonCard
                  key={salon._id || salon.id}
                  salon={salon}
                  onClick={() => setSelectedSalon(salon)}
                />
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && !priceFilter && (
            <div className="pagination">
              <button
                className="page-arrow"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
                aria-label="Previous page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div className="page-numbers">
                {getPaginationRange(meta.currentPage, meta.totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`el-${i}`} className="page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`page-num${p === meta.currentPage ? ' active' : ''}`}
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                className="page-arrow"
                disabled={!meta.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                aria-label="Next page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {selectedSalon && (
        <SalonModal
          salon={selectedSalon}
          onClose={() => setSelectedSalon(null)}
          onUpdate={handleSalonUpdate}
          onDelete={handleSalonDelete}
        />
      )}

      {showAddModal && (
        <AddSalonModal
          districts={districts}
          onClose={() => setShowAddModal(false)}
          onAdd={handleSalonAdd}
        />
      )}
    </div>
  );
}
