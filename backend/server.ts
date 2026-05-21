import 'dotenv/config';
import express, { Application, Request, Response } from "express";
import {connectDB} from "./db";
import { Salon } from "./salonmodel";
import cors from "cors";
const app: Application = express();

app.use(cors());
connectDB()

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 5000;

function escapeRegex(text: string) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


app.get("/salons/districts", async (_req: Request, res: Response) => {
  try {
    const districts = await Salon.distinct("district");
    res.json(districts.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// Basic route
app.get("/salons/search", async (req: Request, res: Response) => {
  try {
    const {q, minRating, maxRating, district} = req.query;
    const filters: any = {};
    if (q) {
      filters.name = { $regex: escapeRegex(q as string), $options: "i" };
    }
    if (minRating || maxRating) {
      filters.rating = {
        ...(minRating && { $gte: Number(minRating) }),
        ...(maxRating && { $lte: Number(maxRating) }),
      };
    }
    if (district) {
      filters.district = district as string;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const [salons,total] = await Promise.all([
      Salon.find(filters).skip(skip).limit(limit),
      Salon.countDocuments(filters)
    ]);

    res.json({
      currentPage: page,
      perPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      data: salons
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to search salons" });
  }
});

// Route to get beauty salons
app.get("/salons", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    // const salons = await getBeautySalons(); // old: fetched from Google Places API
    const [salons,total] = await Promise.all([
      Salon.find().skip(skip).limit(limit),
      Salon.countDocuments()
    ]);
    res.json({
      currentPage: page,
      perPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      data: salons
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch salons" });
  }
});

app.get("/salons/:id", async (req, res) => {
  try {
    // const details = await getPlaceDetails(req.params.id); // old: fetched from Google Places API
    const salon = await Salon.findOne({ id: req.params.id });
    if (!salon) {
      res.status(404).json({ error: "Salon not found" });
      return;
    }
    res.json(salon);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch salon" });
  }
});

app.post("/salons", async (req, res) => {
  try {
    const newSalon = new Salon(req.body);
    await newSalon.save();
    res.status(201).json(newSalon);
  } catch (err) {
    res.status(500).json({ error: "Failed to create salon" });
  }
});

app.patch("/salons/:id", async (req, res) => {
  try {
    const updatedSalon = await Salon.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedSalon) {
      res.status(404).json({ error: "Salon not found" });
      return;
    }
    res.json(updatedSalon);
  } catch (err) {
    res.status(500).json({ error: "Failed to update salon" });
  }
});

app.delete("/salons/:id", async (req, res) => {
  try {
    const deletedSalon = await Salon.findOneAndDelete({ id: req.params.id });
    if (!deletedSalon) {
      res.status(404).json({ error: "Salon not found" });
      return;
    }
    res.json({ message: "Salon deleted" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete salon" });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});