const express = require("express");
const path = require("path");
const dotenv = require("dotenv"); // Load environment variables
const multer = require("multer"); // Handle file uploads
const cloudinary = require("cloudinary").v2; // Use Cloudinary's Node SDK
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { Pool } = require('pg');

dotenv.config(); // Load environment variables from .env file
const app = express();
const port = process.env.PORT || 3000;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

// Connect to PostgreSQL and handle connection errors
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Gracefully handle termination of the server
process.on('SIGINT', async () => {
  await pool.end();
  console.log('PostgreSQL pool closed');
  process.exit(0);
});

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gallery", // Optional folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Accept only specific formats
  },
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Serve the main page
app.get("/", (req, res) => {
  res.render(path.join(__dirname, "views", "index.ejs"));
});

// Serve the gallery page
app.get("/gallery", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM images ORDER BY true_id');
    const images = result.rows;
    res.render(path.join(__dirname, "views", "gallery.ejs"), { images });
  } catch (error) {
    console.error("Error fetching images from the database:", error);
    res.status(500).send("Error fetching images.");
  }
});

// Serve additional pages
app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "history.html"));
});

app.get("/results", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "results.html"));
});

app.get("/upload", (req, res) => {
  res.render(path.join(__dirname, "views", "upload.ejs"));
});

// Image upload route
app.post("/upload", upload.array("images", 10), async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const uploadedUrls = files.map((file) => file.path);
  console.log("Uploaded Image URLs:", uploadedUrls);

  try {
    const insertPromises = uploadedUrls.map(url => {
      return pool.query('INSERT INTO images (url) VALUES ($1)', [url]);
    });
    await Promise.all(insertPromises);
    console.log("URLs inserted into the database");

    res.send(`
      <script>
        alert("Images uploaded successfully!");
        console.log("Uploaded URLs: ", ${JSON.stringify(uploadedUrls)});
        window.location.href = "/upload"; // Redirect back to the upload page
      </script>
    `);
  } catch (error) {
    console.error("Error inserting URLs into the database:", error);
    res.status(500).send("Error saving image URLs to the database.");
  }
});

// Handle any other routes by serving a 404 page
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
