let currentIndex = 0; // current index
let imagesArray = []; // image elements
let touchStartX = 0; // to track touch start position

// Function to create fullscreen view
function openFullscreen(index) {
  currentIndex = index; // Update current index

  const fullscreenDiv = document.createElement("div");
  fullscreenDiv.classList.add("fullscreen");

  // Create the img element for fullscreen
  const fullscreenImg = document.createElement("img");
  fullscreenImg.src = imagesArray[currentIndex].src;
  fullscreenImg.classList.add("fullscreen-img");

  // Append the img to the fullscreen div
  fullscreenDiv.appendChild(fullscreenImg);

  // Add event listener for closing fullscreen mode
  fullscreenDiv.addEventListener("click", () => {
    document.body.removeChild(fullscreenDiv);
  });

  // Add touch event listeners for swipe navigation
  fullscreenDiv.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX; // Record start position
  });

  fullscreenDiv.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].clientX; // Record end position
    handleSwipe(touchStartX, touchEndX); // Handle swipe
  });

  // Add fullscreen div to body
  document.body.appendChild(fullscreenDiv);

  // Focus on the fullscreen div for key event handling
  fullscreenDiv.focus();
}

// Function to handle keydown event
function handleKeydown(event) {
  const fullscreenDiv = document.querySelector(".fullscreen");
  if (fullscreenDiv) {
    if (event.key === "Escape") {
      // Close fullscreen on Escape
      document.body.removeChild(fullscreenDiv);
    } else if (event.key === "ArrowRight") {
      // Navigate to next image
      currentIndex = (currentIndex + 1) % imagesArray.length;
      updateFullscreenImage();
    } else if (event.key === "ArrowLeft") {
      // Navigate to previous image
      currentIndex =
        (currentIndex - 1 + imagesArray.length) % imagesArray.length;
      updateFullscreenImage();
    }
  }
}

// Function to handle swipe navigation
function handleSwipe(startX, endX) {
  const threshold = 50; // Minimum swipe distance
  if (startX - endX > threshold) {
    // Swipe left
    currentIndex = (currentIndex + 1) % imagesArray.length;
  } else if (endX - startX > threshold) {
    // Swipe right
    currentIndex = (currentIndex - 1 + imagesArray.length) % imagesArray.length;
  }
  updateFullscreenImage();
}

// Function to update fullscreen image source when navigating
function updateFullscreenImage() {
  const fullscreenImg = document.querySelector(".fullscreen img");
  fullscreenImg.src = imagesArray[currentIndex].src;
}

// Add event listener for keydown event
document.addEventListener("keydown", handleKeydown);

// Fetch and display images
fetch("/images.json")
  .then((response) => response.json())
  .then((imagePaths) => {
    const gallery = document.getElementById("gallery");
    imagePaths.forEach((path, index) => {
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("img-wrapper");

      const img = document.createElement("img");
      img.src = path;

      // Add image to array
      imagesArray.push(img);

      // Add click event to image
      img.addEventListener("click", () => openFullscreen(index));

      imgWrapper.appendChild(img);
      gallery.appendChild(imgWrapper);
    });
  })
  .catch((error) => console.error("Error fetching image paths:", error));
