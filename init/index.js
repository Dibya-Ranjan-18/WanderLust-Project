if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

// ================= INITIALIZE LOGIC =================
const initDB = async () => {
    try {
        await Listing.deleteMany({});
        
        const validCategories = ["Trending", "Rooms", "Iconic Cities", "Luxury", "Budget"];

        const listingsWithCategory = initData.data.map((obj) => ({
            ...obj,
            owner: "696f92a09f304860d0b82f7b",
            category: validCategories.includes(obj.category) ? obj.category : "Trending"
        }));

        await Listing.insertMany(listingsWithCategory);
        console.log("Database initialized with listings!");
    } catch (err) {
        console.log("Error initializing DB:", err);
    }
};

// ================= RUN CONNECTION & SEED =================
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB Atlas for Seeding");
        await initDB();
    } catch (err) {
        console.log("Connection Error:", err);
    } finally {
        mongoose.connection.close();
        console.log("Connection closed after seeding.");
    }
}

main();