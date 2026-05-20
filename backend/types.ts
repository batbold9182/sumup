export type Place = {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type PlaceDetails = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions: string[] };
  priceLevel?: string;
};
