const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { Pool } = require("pg");
const session = require("express-session");
const bcrypt = require("bcrypt");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Mock user data
const users = [
  {
    username: "fiziksmen",
    password: process.env.ADMIN_PW,
  },
];

// Ensure password is hashed correctly
const saltRounds = 10; // You can adjust this for more security

const isAdmin = (req, res, next) => {
  if (req.session.user) {
    next(); // User is logged in
  } else {
    req.session.redirectTo = req.originalUrl; // Store the original URL to redirect after login
    res.redirect("/login"); // Redirect to login page
  }
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// Connect to PostgreSQL and handle connection errors
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

// Gracefully handle termination of the server
process.on("SIGINT", async () => {
  await pool.end();
  console.log("PostgreSQL pool closed");
  process.exit(0);
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gallery",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  try {
    // Fetch the last 3 images from Cloudinary in descending order
    const cloudinaryResult = await cloudinary.api.resources({
      type: "upload",
      prefix: "gallery/", // The folder name or prefix where the images are stored
      max_results: 3, // Fetch the last 3 images
      resource_type: "image", // Ensure it's fetching images
      order: "desc", // Order by most recent first
    });

    // Map the Cloudinary results to get the image URLs
    const latestImages = cloudinaryResult.resources.map((resource) => ({
      url: resource.secure_url,
      public_id: resource.public_id,
    }));

    // Fetch the last 3 results from the database (results part remains unchanged)
    const resultsQuery = await pool.query(
      "SELECT * FROM results ORDER BY id DESC LIMIT 3;"
    );
    const latestResults = resultsQuery.rows; // Get the rows returned by the results query

    // Pass the fetched images and results to the index.ejs template
    res.render(path.join(__dirname, "views", "index.ejs"), {
      latestImages, // Last 3 images from Cloudinary
      latestResults, // Last 3 results from the database
      session: req.session,
    });
  } catch (error) {
    console.error(
      "Error fetching latest images or results from the database:",
      error
    );
    res.status(500).send("Error displaying homepage.");
  }
});

// Serve the gallery page
app.get("/gallery", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "gallery/",
      max_results: 100,
      resource_type: "image",
      order: "desc",
    });

    const images = result.resources.map((resource) => ({
      url: resource.secure_url,
      public_id: resource.public_id,
    }));

    console.log(images); // Log the images array to check the URLs

    res.render("gallery", { images: images, session: req.session });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    res.status(500).send("Error fetching images.");
  }
});

app.post("/gallery/delete", async (req, res) => {
  const { public_id } = req.body;

  try {
    // Delete the image from Cloudinary using the public ID
    const result = await cloudinary.uploader.destroy(public_id);

    // Check the result of the deletion
    if (result.result === "ok") {
      console.log("Image deleted from Cloudinary:", result);
      // Redirect back to the gallery after successful deletion
      res.redirect("/gallery");
    } else {
      console.error("Error deleting image from Cloudinary:", result);
      res.status(500).send("Error deleting image from Cloudinary.");
    }
  } catch (error) {
    console.error("Error in delete operation:", error);
    res.status(500).send("Error deleting image.");
  }
});

// Serve additional pages
app.get("/history", (req, res) => {
  res.render(path.join(__dirname, "views", "history.ejs"), {
    session: req.session,
  });
});

app.get("/results", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results ORDER BY id DESC;");
    const results = result.rows;

    // Pass the session object to the EJS template
    res.render(path.join(__dirname, "views", "results.ejs"), {
      results,
      session: req.session,
    });
  } catch (error) {
    console.error("Error fetching results from the database:", error);
    res.status(500).send("Error fetching results.");
  }
});

app.get("/gallery/upload", isAdmin, (req, res) => {
  res.render(path.join(__dirname, "views", "upload.ejs"));
});

app.get("/results/upload", isAdmin, (req, res) => {
  res.render(path.join(__dirname, "views", "uploadResult.ejs"));
});

app.get("/login", (req, res) => {
  const error = req.query.error || null; // Get the error message from the query params
  res.render(path.join(__dirname, "views", "login.ejs"), { error });
});

// Updated login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);

  if (user) {
    // Compare hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // If password is correct, store user info in session
        req.session.user = user;

        // Redirect to the originally requested page or the homepage
        const redirectTo = req.session.redirectTo || "/"; // Use stored URL or default to "/"
        delete req.session.redirectTo; // Clear the stored URL after using it
        return res.redirect(redirectTo);
      } else {
        return res.render("login", { error: "Invalid password" });
      }
    });
  } else {
    return res.render("login", { error: "User not found" });
  }
});

// Image upload route
app.post("/upload", upload.array("images", 10), async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  // Create an array of promises to upload each image to Cloudinary
  const uploadPromises = files.map((file) => {
    return cloudinary.uploader.upload(file.path, {
      use_filename: true, // Use the original filename
    });
  });

  try {
    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);

    // Extract the URLs from the Cloudinary upload results
    const uploadedUrls = uploadResults.map((result) => result.secure_url);

    // Optionally, save the Cloudinary URLs to your database here

    // Redirect back to the gallery page after successful upload
    res.redirect("/gallery");
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).send("Error uploading images to Cloudinary.");
  }
});

app.post("/results/upload", upload.single("image"), async (req, res) => {
  const { heading, description, type, date } = req.body;
  const imageUrl = req.file.path; // Adjust this if you're uploading to a service like Cloudinary

  try {
    // Save the result to the database
    await pool.query(
      "INSERT INTO results (image_url, heading, description, type, date) VALUES ($1, $2, $3, $4, $5)",
      [imageUrl, heading, description, type, date]
    );
    console.log("Result added to the database");
    res.redirect("/results");
  } catch (error) {
    console.error("Error saving result to the database:", error);
    res.status(500).send("Error saving result.");
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
