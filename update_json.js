const fs = require("fs");
const chokidar = require("chokidar");
const path = require("path");

// Path to the images folder
const imagesFolder = path.join(__dirname, "slike");

// Path to the JSON file
const jsonFile = path.join(__dirname, "images.json");

// Function to update the JSON file
function updateJsonFile() {
  fs.readdir(imagesFolder, (err, files) => {
    if (err) {
      console.error("Error reading the images folder:", err);
      return;
    }

    // Filter to include only image files (e.g., jpg, png)
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    // Create an array of image paths
    const imagePaths = imageFiles.map((file) => path.join("slike", file));

    // Write the paths to the JSON file
    fs.writeFile(jsonFile, JSON.stringify(imagePaths, null, 2), (err) => {
      if (err) {
        console.error("Error writing to the JSON file:", err);
      } else {
        console.log("JSON file updated successfully.");
      }
    });
  });
}

// Watch the images folder for changes
const watcher = chokidar.watch(imagesFolder, { persistent: true });

watcher.on("add", updateJsonFile).on("unlink", updateJsonFile);

console.log("Watching for changes in the images folder...");
