# Warsaw Beauty Salons

A fullstack salon discovery and management app built as part of the SumUp Accelerator take-home challenge.

**Live demo:** [sumup-gray.vercel.app](https://sumup-gray.vercel.app)  
**Backend API:** [sumup-4oxv.onrender.com](https://sumup-4oxv.onrender.com)

---

## Features

- **Browse** 257 real Warsaw beauty salons fetched from Google Places API
- **Search** by salon name with debounced live search and ReDoS protection
- **Filter** by district, minimum rating, and price level
- **Paginated** results — 12 per page with numbered pages and previous/next navigation
- **Salon detail modal** — view full info including opening hours, phone, website
- **Add salon** — create a new salon entry via POST
- **Edit salon** — update name, address, phone, website, district via PATCH
- **Delete salon** — remove a salon from the database
- **Responsive** — works on desktop and mobile
- **Dark mode** — automatic via `prefers-color-scheme`

---

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Google Places API v1
- Deployed on **Render**

### Frontend
- React + TypeScript
- Vite
- Deployed on **Vercel**

---

## Data Collection

Salon data is fetched once using a populate script that queries the Google Places API v1 with 5 search queries:

```
hair salon Warsaw
beauty salon Warsaw
fryzjer Warszawa
nail salon Warsaw
barber Warsaw
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/salons` | Get all salons (paginated) |
| GET | `/salons/search` | Search by name, district, rating |
| GET | `/salons/districts` | Get all unique districts |
| GET | `/salons/:id` | Get single salon |
| POST | `/salons` | Create new salon |
| PATCH | `/salons/:id` | Update salon fields |
| DELETE | `/salons/:id` | Delete salon |

### Query Parameters

`GET /salons?page=1&limit=12`  
`GET /salons/search?q=anna&minRating=4&district=Mokotów&page=1`

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Places API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run dev
```

`.env` variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_places_api_key
```

### Populate database (run once)

```bash
cd backend
npm run populate
```

This fetches 257 Warsaw salons from Google Places API and saves them to MongoDB.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
sumup/
├── backend/
│   ├── server.ts        # Express app + all routes
│   ├── populateDB.ts    # One-time data fetch script
│   ├── salonmodel.ts    # Mongoose schema
│   ├── db.ts            # MongoDB connection
│   ├── places.ts        # Google Places API fetch helper
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main app + state management
│   │   ├── api.ts           # All fetch calls to backend
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── components/
│   │       ├── SalonCard.tsx
│   │       └── SalonModal.tsx
|   │       └── AddSalonModal.tsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Known Limitations

- Price level data is unavailable for most Warsaw salons — Google Places only provides this for ~5% of independent beauty salon listings
- No authentication — any user can edit or delete salons.

---

## What I Would Add With More Time

- JWT authentication + user accounts
- Favorites — save salons per user
- Salon photos via Google Places photo references
- Booking system — request appointments directly
- Extend populate script to cover all major Polish cities

---

*Built by Batbold Samdan · [github.com/batbold9182](https://github.com/batbold9182)*