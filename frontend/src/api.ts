import type { PaginatedSalons, Salon } from './types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getSalons(page = 1, limit = 12): Promise<PaginatedSalons> {
  const res = await fetch(`${BASE}/salons?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch salons');
  return res.json();
}

export async function searchSalons(
  q: string,
  minRating: number,
  district: string,
  page = 1,
  limit = 12
): Promise<PaginatedSalons> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (minRating > 0) params.set('minRating', String(minRating));
  if (district) params.set('district', district);
  const res = await fetch(`${BASE}/salons/search?${params}`);
  if (!res.ok) throw new Error('Failed to search salons');
  return res.json();
}

export async function getDistricts(): Promise<string[]> {
  const res = await fetch(`${BASE}/salons/districts`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return res.json();
}

export async function updateSalon(id: string, data: Partial<Salon>): Promise<Salon> {
  const res = await fetch(`${BASE}/salons/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update salon');
  return res.json();
}

export async function createSalon(data: Omit<Salon, '_id'>): Promise<Salon> {
  const res = await fetch(`${BASE}/salons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create salon');
  return res.json();
}

export async function deleteSalon(id: string): Promise<void> {
  const res = await fetch(`${BASE}/salons/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete salon');
}
