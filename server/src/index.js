import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/db.js";
import seedLectures from "./seed/seedLectures.js";
import seedCodingExercises from "./seed/seedCodingExercises.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Bind to 0.0.0.0 so cloud platforms (Render, Railway, etc.) detect open port immediately
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    try {
      await connectDatabase();
      await seedLectures();
      await seedCodingExercises();
    } catch (error) {
      console.error("Startup database initialization warning:", error.message);
    }
  });
};

start();
