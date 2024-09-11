fetch("../images.json")
  .then((response) => response.json())
  .then((imagePaths) => {
    const gallery = document.getElementById("gallery");
    imagePaths.forEach((path) => {
      // Create a wrapper div for the image
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("img-wrapper");

      // Create the img element
      const img = document.createElement("img");
      img.src = path;

      // Append the img to the wrapper
      imgWrapper.appendChild(img);

      // Append the wrapper to the gallery
      gallery.appendChild(imgWrapper);
    });
  })
  .catch((error) => console.error("Error fetching image paths:", error));
