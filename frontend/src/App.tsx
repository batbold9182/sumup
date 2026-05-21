import { useState, useEffect, useCallback } from 'react';
import type { Salon, PaginationMeta } from './types';
import { getSalons, searchSalons, getDistricts } from './api';
import { SalonCard } from './components/SalonCard';
import { SalonModal } from './components/SalonModal';
import './App.css';

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
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, minRating, district]);

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

  const handleSalonUpdate = useCallback((updated: Salon) => {
    setSalons(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelectedSalon(updated);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Warsaw Beauty Salons</h1>
        <p className="subtitle">Browse and manage beauty salons across Warsaw</p>
      </header>

      <div className="filters">
        <input
          className="search-input"
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="filter-select"
          value={minRating}
          onChange={e => setMinRating(Number(e.target.value))}
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
          <option value="$">$ Budget</option>
          <option value="$$">$$ Mid-range</option>
          <option value="$$$">$$$ Premium</option>
          <option value="$$$$">$$$$ Luxury</option>
        </select>
        <select
          className="filter-select"
          value={district}
          onChange={e => setDistrict(e.target.value)}
        >
          <option value="">Any district</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading salons…</div>
      ) : (
        <>
          {meta && (
            <p className="results-count">
              {priceFilter
                ? `Showing ${filteredSalons.length} of ${meta.totalItems} salons`
                : `${meta.totalItems} salons found`}
            </p>
          )}

          {filteredSalons.length === 0 ? (
            <div className="empty-state">No salons found matching your criteria.</div>
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

          {meta && meta.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {meta.currentPage} of {meta.totalPages}
              </span>
              <button
                className="page-btn"
                disabled={!meta.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
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
        />
      )}
    </div>
  );
}
