import { useState } from 'react';
import type { Salon } from '../types';
import { createSalon } from '../api';

interface Props {
  districts: string[];
  onClose: () => void;
  onAdd: (salon: Salon) => void;
}

const PRICE_LEVELS = ['$', '$$', '$$$', '$$$$'];

export function AddSalonModal({ districts, onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    priceLevel: '',
    district: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);

  const set = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Omit<Salon, '_id'> = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        address:    form.address.trim()   || undefined,
        phone:      form.phone.trim()     || undefined,
        website:    form.website.trim()   || undefined,
        priceLevel: form.priceLevel       || undefined,
        district:   form.district         || undefined,
      };
      const created = await createSalon(payload);
      onAdd(created);
      onClose();
    } catch {
      setError('Failed to create salon. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <span className="modal-eyebrow">New salon</span>
            <h2 className="modal-title">Add Salon</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-field">
              <label>Name *</label>
              <input
                type="text"
                placeholder="e.g. Beauty Studio Warsaw"
                value={form.name}
                onChange={e => { set('name', e.target.value); setNameError(false); }}
                style={nameError ? { borderColor: '#f87171' } : undefined}
                autoFocus
              />
              {nameError && <p className="form-error" style={{ margin: '2px 0 0' }}>Name is required</p>}
            </div>

            <div className="form-field">
              <label>Address</label>
              <input
                type="text"
                placeholder="e.g. Nowy Świat 15, 00-029 Warszawa"
                value={form.address}
                onChange={e => set('address', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Price level</label>
                <select
                  className="filter-select"
                  style={{ width: '100%' }}
                  value={form.priceLevel}
                  onChange={e => set('priceLevel', e.target.value)}
                >
                  <option value="">Not specified</option>
                  {PRICE_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label>District</label>
                {districts.length > 0 ? (
                  <select
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={form.district}
                    onChange={e => set('district', e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Śródmieście"
                    value={form.district}
                    onChange={e => set('district', e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                placeholder="e.g. +48 22 000 0000"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Website</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={e => set('website', e.target.value)}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Adding…' : 'Add Salon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
