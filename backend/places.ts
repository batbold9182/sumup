// Used only by populateDB.ts to fetch data from Google Places API.
// Not used by the server at runtime — data is served from MongoDB.
import { PlaceDetails, Place } from "./types";

const API_KEY = process.env.GOOGLE_API_KEY!;

export async function getBeautySalons() {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id," +
          "places.displayName," +
          "places.formattedAddress," +
          "places.location"
      },
      body: JSON.stringify({
        textQuery: `beauty salons in Warsaw`
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  return (data.places ?? []).map((p: Place) => ({
    id: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
  }));
}

export async function getPlaceDetails(placeId: string) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "id," +
          "displayName," +
          "formattedAddress," +
          "location," +
          "nationalPhoneNumber," +
          "internationalPhoneNumber," +
          "websiteUri," +
          "rating," +
          "userRatingCount," +
          "regularOpeningHours," +
          "priceLevel"
      }
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const p: PlaceDetails = await response.json();

  return {
    id: p.id,
    name: p.displayName?.text ?? null,
    address: p.formattedAddress ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    phone: p.nationalPhoneNumber ?? null,
    phoneInternational: p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    rating: p.rating ?? null,
    totalRatings: p.userRatingCount ?? null,
    openingHours: p.regularOpeningHours?.weekdayDescriptions ?? null,
    priceLevel: p.priceLevel ?? null,
  };
}