// One-time script to fetch beauty salons from Google Places API and store them in MongoDB.
// Run with: npm run populate
// Not used by the server at runtime.
import 'dotenv/config';
import { connectDB } from "./db";
import { Salon } from "./salonmodel";

const searches = [
    'hair salon Warsaw',
    'beauty salon Warsaw',
    'fryzjer Warszawa',
    'nail salon Warsaw',
    'barber Warsaw',
];

async function fetchAllPlaces(query: string) {
    const allPlaces: any[] = [];
    let pageToken: string | undefined;

    do {
        const response = await fetch(
            "https://places.googleapis.com/v1/places:searchText",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!,
                    "X-Goog-FieldMask":
                        "places.id," +
                        "places.formattedAddress," +
                        "places.addressComponents," +
                        "places.location," +
                        "places.displayName," +
                        "places.nationalPhoneNumber," +
                        "places.internationalPhoneNumber," +
                        "places.websiteUri," +
                        "places.rating," +
                        "places.userRatingCount," +
                        "places.priceLevel," +
                        "places.regularOpeningHours," +
                        "nextPageToken"
                },
                body: JSON.stringify({
                    textQuery: query,
                    ...(pageToken && { pageToken })
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const data = await response.json();
        allPlaces.push(...(data.places ?? []));
        pageToken = data.nextPageToken;

    } while (pageToken);

    return allPlaces;
}

function extractDistrict(components: any[]): string | null {
  if (!components || !Array.isArray(components)) return null;
  
  const sublocality = components.find(c => 
    c.types && c.types.includes('sublocality') || 
    c.types && c.types.includes('sublocality_level_1')
  );
  if (sublocality) return sublocality.longText;

  const area = components.find(c => 
    c.types && c.types.includes('administrative_area_level_2')
  );
  if (area) return area.longText;

  return null;
}

async function main() {
    await connectDB();

    const seen = new Set<string>();
    const allPlaces: any[] = [];

    for (const query of searches) {
        const places = await fetchAllPlaces(query);
        for (const place of places) {
            if (!seen.has(place.id)) {
                seen.add(place.id);
                allPlaces.push({
                    id: place.id,
                    name: place.displayName?.text ?? null,
                    address: place.formattedAddress ?? null,
                    location: place.location ?? null,
                     district: extractDistrict(place.addressComponents),
                    phone: place.nationalPhoneNumber ?? null,
                    phoneInternational: place.internationalPhoneNumber ?? null,
                    website: place.websiteUri ?? null,
                    rating: place.rating ?? null,
                    totalRatings: place.userRatingCount ?? null,
                    priceLevel: place.priceLevel ?? null,
                    openingHours: place.regularOpeningHours?.weekdayDescriptions ?? null,
                });
            }
        }
        console.log(`${query}: ${places.length} results | total unique: ${allPlaces.length}`);
    }

    await Salon.insertMany(allPlaces, { ordered: false });
    console.log(`Saved ${allPlaces.length} salons to MongoDB`);
    process.exit(0);
}

main();
