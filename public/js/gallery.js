function toggleSideMenu() {
  const menu = document.querySelector(".side-menu");
  menu.classList.toggle("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".gallery-item img"); // All images in the gallery
  let currentIndex = 0;

  // Variables for touch events
  let startX = 0;
  let endX = 0;

  // Open modal and display the clicked image
  images.forEach((img, index) => {
    img.dataset.index = index; // Store the index in a data attribute
    img.addEventListener("click", () => {
      currentIndex = parseInt(img.dataset.index);
      openModal(currentIndex);
    });
  });

  // Close the modal when "X" is clicked or when clicking outside the modal content
  document.getElementById("closeModal").addEventListener("click", closeModal);

  // Add event listener to the fullscreen modal to detect clicks outside the image
  const fullscreenModal = document.getElementById("fullscreenModal");
  fullscreenModal.addEventListener("click", (event) => {
    // Close the modal only if clicked outside the image
    if (event.target === fullscreenModal) {
      closeModal();
    }
  });

  // Function to open modal
  function openModal(index) {
    showImage(index);
    fullscreenModal.style.display = "block";
  }

  // Function to close modal
  function closeModal() {
    fullscreenModal.style.display = "none";
  }

  // Function to show the image at a specific index
  function showImage(index) {
    const imgUrl = images[index].getAttribute("src");
    document.getElementById("fullscreenImage").setAttribute("src", imgUrl);
  }

  // Navigate to the previous image
  document.querySelector(".prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  });

  // Navigate to the next image
  document.querySelector(".next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  });

  // Use arrow keys to navigate through the images in fullscreen mode
  document.addEventListener("keydown", (event) => {
    const modalVisible = fullscreenModal.style.display === "block";
    if (modalVisible) {
      switch (event.key) {
        case "ArrowLeft":
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          showImage(currentIndex);
          break;
        case "ArrowRight":
          currentIndex = (currentIndex + 1) % images.length;
          showImage(currentIndex);
          break;
        case "Escape":
          closeModal();
          break;
      }
    }
  });

  // Swipe functionality for mobile devices
  fullscreenModal.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  });

  fullscreenModal.addEventListener("touchmove", (event) => {
    endX = event.touches[0].clientX;
  });

  fullscreenModal.addEventListener("touchend", () => {
    const threshold = 50; // Minimum distance (in pixels) to consider it a valid swipe
    if (startX - endX > threshold) {
      // Swipe left: Show the next image
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    } else if (endX - startX > threshold) {
      // Swipe right: Show the previous image
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    }
    // Reset values after swipe is detected
    startX = 0;
    endX = 0;
  });
});
