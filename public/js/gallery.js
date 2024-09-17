// Add this to your gallery.js

// Function to create fullscreen view
function openFullscreen(img) {
  const fullscreenDiv = document.createElement("div");
  fullscreenDiv.classList.add("fullscreen");

  // Create the img element for fullscreen
  const fullscreenImg = document.createElement("img");
  fullscreenImg.src = img.src;

  // Append the img to the fullscreen div
  fullscreenDiv.appendChild(fullscreenImg);

  // Add event listener for closing fullscreen mode
  fullscreenDiv.addEventListener("click", () => {
    document.body.removeChild(fullscreenDiv);
  });

  // Append the fullscreen div to the body
  document.body.appendChild(fullscreenDiv);
}

// Function to handle keydown event
function handleKeydown(event) {
  if (event.key === "Escape") {
    const fullscreenDiv = document.querySelector(".fullscreen");
    if (fullscreenDiv) {
      document.body.removeChild(fullscreenDiv);
    }
  }
}

// Add event listener for keydown event
document.addEventListener("keydown", handleKeydown);

// Fetch and display images
fetch("/images.json")
  .then((response) => response.json())
  .then((imagePaths) => {
    const gallery = document.getElementById("gallery");
    imagePaths.forEach((path) => {
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("img-wrapper");

      const img = document.createElement("img");
      img.src = path;

      // Add click event to image
      img.addEventListener("click", () => openFullscreen(img));

      imgWrapper.appendChild(img);
      gallery.appendChild(imgWrapper);
    });
  })
  .catch((error) => console.error("Error fetching image paths:", error));
