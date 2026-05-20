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

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('check gitignore');
});

// Route to get beauty salons
app.get("/salons", async (_req, res) => {
  try {
    // const salons = await getBeautySalons(); // old: fetched from Google Places API
    const salons = await Salon.find();
    res.json(salons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch salons" });
  }
});

app.get("/salon/:id", async (req, res) => {
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

app.post("/salon", async (req, res) => {
  try {
    const newSalon = new Salon(req.body);
    await newSalon.save();
    res.status(201).json(newSalon);
  } catch (err) {
    res.status(500).json({ error: "Failed to create salon" });
  }
});

app.patch("/salon/:id", async (req, res) => {
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

app.delete("/salon/:id", async (req, res) => {
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
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});