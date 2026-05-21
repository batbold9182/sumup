import { useEffect, useState } from 'react';
import type { Salon } from '../types';
import { updateSalon } from '../api';

interface Props {
  salon: Salon;
  onClose: () => void;
  onUpdate: (updated: Salon) => void;
}

const EDITABLE_FIELDS: { key: keyof Salon; label: string; type?: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  { key: 'phoneInternational', label: 'International Phone' },
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'priceLevel', label: 'Price Level' },
  { key: 'district', label: 'District' },
];

export function SalonModal({ salon, onClose, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Salon>>({
    name: salon.name,
    address: salon.address,
    phone: salon.phone,
    phoneInternational: salon.phoneInternational,
    website: salon.website,
    priceLevel: salon.priceLevel,
    district: salon.district,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
}, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSalon(salon.id, formData);
      onUpdate(updated);
      setIsEditing(false);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: salon.name,
      address: salon.address,
      phone: salon.phone,
      phoneInternational: salon.phoneInternational,
      website: salon.website,
      priceLevel: salon.priceLevel,
      district: salon.district,
    });
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Salon' : salon.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <>
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
              {error && <p className="form-error">{error}</p>}
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
              <div className="detail-grid">
                {salon.rating !== undefined && (
                  <div className="detail-row">
                    <span className="detail-label">Rating</span>
                    <span className="detail-value">
                      {salon.rating.toFixed(1)} / 5
                      {salon.totalRatings !== undefined && (
                        <span className="rating-count"> ({salon.totalRatings.toLocaleString()} reviews)</span>
                      )}
                    </span>
                  </div>
                )}
                {salon.priceLevel && (
                  <div className="detail-row">
                    <span className="detail-label">Price</span>
                    <span className="detail-value price-badge">{salon.priceLevel}</span>
                  </div>
                )}
                {salon.address && (
                  <div className="detail-row">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{salon.address}</span>
                  </div>
                )}
                {salon.district && (
                  <div className="detail-row">
                    <span className="detail-label">District</span>
                    <span className="detail-value">{salon.district}</span>
                  </div>
                )}
                {salon.phone && (
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">
                      <a href={`tel:${salon.phoneInternational || salon.phone}`}>{salon.phone}</a>
                    </span>
                  </div>
                )}
                {salon.website && (
                  <div className="detail-row">
                    <span className="detail-label">Website</span>
                    <span className="detail-value">
                      <a href={salon.website} target="_blank" rel="noopener noreferrer">
                        {salon.website}
                      </a>
                    </span>
                  </div>
                )}
                {salon.openingHours && salon.openingHours.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Hours</span>
                    <ul className="hours-list">
                      {salon.openingHours.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Details
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
