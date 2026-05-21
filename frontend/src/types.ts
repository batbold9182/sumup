export interface Salon {
  _id: string;
  id: string;
  name: string;
  address?: string;
  district?: string;
  location?: { latitude: number; longitude: number };
  phone?: string;
  phoneInternational?: string;
  website?: string;
  rating?: number;
  totalRatings?: number;
  priceLevel?: string;
  openingHours?: string[];
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalons extends PaginationMeta {
  data: Salon[];
}
