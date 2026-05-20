import mongoose from "mongoose";

const salonSchema = new mongoose.Schema({
    id:                 { type: String, required: true, unique: true },
    name:               { type: String, required: true },
    address:            { type: String },
    location: {
        latitude:       { type: Number },
        longitude:      { type: Number },
    },
    phone:              { type: String },
    phoneInternational: { type: String },
    website:            { type: String },
    rating:             { type: Number },
    totalRatings:       { type: Number },
    priceLevel:         { type: String },
    openingHours:       { type: [String] },
});

export const Salon = mongoose.model("Salon", salonSchema);