import { useEffect, useState } from 'react';
import type { Salon } from '../types';
import { updateSalon, deleteSalon } from '../api';

const PRICE_DISPLAY: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE:    '$',
  PRICE_LEVEL_MODERATE:       '$$',
  PRICE_LEVEL_EXPENSIVE:      '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

function formatPrice(raw: string): string {
  return PRICE_DISPLAY[raw] ?? raw;
}

const EDITABLE_FIELDS: { key: keyof Salon; label: string; type?: string }[] = [
  { key: 'name',               label: 'Name' },
  { key: 'address',            label: 'Address' },
  { key: 'phone',              label: 'Phone' },
  { key: 'phoneInternational', label: 'International Phone' },
  { key: 'website',            label: 'Website', type: 'url' },
  { key: 'priceLevel',         label: 'Price Level' },
  { key: 'district',           label: 'District' },
];

const Icon = {
  tag: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41L12 2z"/>
      <circle cx="7" cy="7" r="1" fill="currentColor"/>
    </svg>
  ),
  map: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  home: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.28 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  web: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  close: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
};

interface Props {
  salon: Salon;
  onClose: () => void;
  onUpdate: (updated: Salon) => void;
  onDelete: (id: string) => void;
}

export function SalonModal({ salon, onClose, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Salon>>({
    name:               salon.name,
    address:            salon.address,
    phone:              salon.phone,
    phoneInternational: salon.phoneInternational,
    website:            salon.website,
    priceLevel:         salon.priceLevel,
    district:           salon.district,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateSalon(salon.id, formData);
      onUpdate(updated);
      setIsEditing(false);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: salon.name, address: salon.address, phone: salon.phone,
      phoneInternational: salon.phoneInternational, website: salon.website,
      priceLevel: salon.priceLevel, district: salon.district,
    });
    setSaveError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSalon(salon.id);
      onDelete(salon.id);
      onClose();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            {isEditing ? (
              <span className="modal-eyebrow">Editing salon</span>
            ) : salon.rating !== undefined ? (
              <span className="modal-rating-badge">
                ★ {salon.rating.toFixed(1)}
                {salon.totalRatings !== undefined && (
                  <> · {salon.totalRatings.toLocaleString()} reviews</>
                )}
              </span>
            ) : null}
            <h2 className="modal-title">{isEditing ? 'Edit Details' : salon.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">{Icon.close}</button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <>
              <div className="form-grid">
                {EDITABLE_FIELDS.map(({ key, label, type }) => (
                  <div className="form-field" key={key}>
                    <label>{label}</label>
                    <input
                      type={type || 'text'}
                      value={(formData[key] as string) || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              {saveError && <p className="form-error">{saveError}</p>}
              <div className="modal-actions">
                <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="detail-list">
                {salon.priceLevel && (
                  <div className="detail-item">
                    <span className="detail-icon">{Icon.tag}</span>
                    <span className="detail-label">Price</span>
                    <span className="detail-value">
                      <span className="price-tag">{formatPrice(salon.priceLevel)}</span>
                    </span>
                  </div>
                )}
                {salon.address && (
                  <div className="detail-item">
                    <span className="detail-icon">{Icon.map}</span>
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{salon.address}</span>
                  </div>
                )}
                {salon.district && (
                  <div className="detail-item">
                    <span className="detail-icon">{Icon.home}</span>
                    <span className="detail-label">District</span>
                    <span className="detail-value">{salon.district}</span>
                  </div>
                )}
                {salon.phone && (
                  <div className="detail-item">
                    <span className="detail-icon">{Icon.phone}</span>
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">
                      <a href={`tel:${salon.phoneInternational || salon.phone}`}
                        className="detail-link">{salon.phone}</a>
                    </span>
                  </div>
                )}
                {salon.website && (
                  <div className="detail-item">
                    <span className="detail-icon">{Icon.web}</span>
                    <span className="detail-label">Website</span>
                    <span className="detail-value">
                      <a href={salon.website} target="_blank" rel="noopener noreferrer"
                        className="detail-link detail-url">
                        {salon.website.replace(/^https?:\/\//, '')}
                      </a>
                    </span>
                  </div>
                )}
                {salon.totalRatings !== undefined && (
                  <div className="detail-item">
                    <span className="detail-icon" style={{ color: '#f59e0b' }}>{Icon.star}</span>
                    <span className="detail-label">Reviews</span>
                    <span className="detail-value">{salon.totalRatings.toLocaleString()} reviews</span>
                  </div>
                )}
                {salon.openingHours && salon.openingHours.length > 0 && (
                  <div className="detail-item detail-item--col">
                    <div className="detail-item-header">
                      <span className="detail-icon">{Icon.clock}</span>
                      <span className="detail-label">Opening Hours</span>
                    </div>
                    <ul className="hours-list">
                      {salon.openingHours.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {confirmDelete && (
                <div className="delete-confirm">
                  <span className="delete-confirm-text">
                    Permanently delete <strong>{salon.name}</strong>?
                  </span>
                  <button className="btn-secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                    Cancel
                  </button>
                  <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                </div>
              )}

              <div className="modal-actions-split">
                <button className="btn-danger" onClick={() => setConfirmDelete(true)} disabled={confirmDelete}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Delete
                </button>
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  {Icon.edit} Edit Details
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
