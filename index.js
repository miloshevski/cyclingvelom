const express = require("express");
const path = require("path");
const dotenv = require("dotenv"); // Load environment variables
const multer = require("multer"); // Handle file uploads
const cloudinary = require("cloudinary").v2; // Use Cloudinary's Node SDK
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const fs = require("fs");
const galleryFile = path.join(__dirname, "gallery.json");

dotenv.config(); // Load the .env file

const app = express();
const port = process.env.PORT || 3000;

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
app.get("/gallery", (req, res) => {
  res.render(path.join(__dirname, "views", "gallery.ejs"));
});
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
app.post("/upload", upload.array("images", 10), (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  // Log each uploaded file URL and store them in an array
  const uploadedUrls = files.map((file) => file.path);
  console.log("Uploaded Image URLs:", uploadedUrls);

  // Send an HTML response with a success alert and list of uploaded URLs
  res.send(`
    <script>
      alert("Images uploaded successfully!");
      console.log("Uploaded URLs: ", ${JSON.stringify(uploadedUrls)});
      window.location.href = "/upload"; // Redirect back to the upload page
    </script>
  `);
});

// Handle any other routes by serving a 404 page
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
