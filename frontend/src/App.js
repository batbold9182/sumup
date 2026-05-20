import './App.css';
import { useState } from 'react';
function App() {
  const [salons, setSalons] = useState([]);

  const fetchSalons = () => {
    fetch("http://localhost:5000/salons")
      .then((res) => res.json())
      .then((data) => setSalons(data))
      .catch((err) => console.error("Error fetching salons:", err));
  }

  return (
    <div>
      <button onClick={fetchSalons}>
        Fetch Salons
      </button>
      <ul>
        {salons.map((salon) => (
          <li key={salon.id}>
            <strong>{salon.name}</strong>
            <p>{salon.address}</p>
            {salon.phone && <p>Phone: {salon.phone}</p>}
            {salon.website && <p>Website: <a href={salon.website} target="_blank" rel="noreferrer">{salon.website}</a></p>}
            {salon.rating && <p>Rating: {salon.rating} ⭐ ({salon.totalRatings} reviews)</p>}
            {salon.priceLevel && <p>Price: {salon.priceLevel.replace("PRICE_LEVEL_", "")}</p>}
            {salon.openingHours && (
              <ul>
                {salon.openingHours.map((day, i) => <li key={i}>{day}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
