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
// Uncomment this section to generate a hash for the password "firebird"
// bcrypt.hash("firebird", saltRounds, (err, hash) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(hash); // Use this hash in your users array
// });

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
  ssl: {
    rejectUnauthorized: false,
  },
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
    // Fetch the last 3 images from the database
    const imagesResult = await pool.query(
      "SELECT * FROM images ORDER BY true_id DESC LIMIT 3;"
    );
    const latestImages = imagesResult.rows; // Get the rows returned by the images query

    // Fetch the last 3 results from the database
    const resultsQuery = await pool.query(
      "SELECT * FROM results ORDER BY id DESC LIMIT 3;"
    );
    const latestResults = resultsQuery.rows; // Get the rows returned by the results query

    // Pass the fetched images and results to the index.ejs template
    res.render(path.join(__dirname, "views", "index.ejs"), {
      latestImages,
      latestResults,
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
    const result = await pool.query(
      "SELECT * FROM images ORDER BY true_id DESC"
    );
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

app.get("/results", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM results ORDER BY id DESC;");
    const results = result.rows;
    res.render(path.join(__dirname, "views", "results.ejs"), { results });
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

  const uploadedUrls = files.map((file) => file.path);

  try {
    const insertPromises = uploadedUrls.map((url) => {
      return pool.query("INSERT INTO images (url) VALUES ($1)", [url]);
    });
    await Promise.all(insertPromises);

    // Instead of sending a script, just send a success response
    res.redirect("/gallery"); // Redirect back to the upload page
  } catch (error) {
    console.error("Error inserting URLs into the database:", error);
    res.status(500).send("Error saving image URLs to the database.");
  }
});

app.post("/results/upload", upload.single("image"), async (req, res) => {
  const { heading, description } = req.body;
  const imageUrl = req.file.path; // Get uploaded image URL from Cloudinary

  try {
    // Insert result into the database
    await pool.query(
      "INSERT INTO results (image_url, heading, description) VALUES ($1, $2, $3)",
      [imageUrl, heading, description]
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
