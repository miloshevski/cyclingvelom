// Select the file input and the label
const imageInput = document.getElementById("image");
const label = document.querySelector("label[for='image']");

// Create an image element to display the preview
const imgPreview = document.createElement("img");
imgPreview.style.maxWidth = "200px"; // Set the max width for the preview
imgPreview.style.display = "none"; // Initially hide the preview
imgPreview.style.marginTop = "10px"; // Add some spacing above the image

// Append the image preview below the label
label.parentNode.insertBefore(imgPreview, label.nextSibling);

// Function to handle image preview
imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  // Check if a file is selected
  if (file) {
    const reader = new FileReader();

    // Set the src of the preview image to the file URL once it's loaded
    reader.onload = function (e) {
      imgPreview.src = e.target.result;
      imgPreview.style.display = "block"; // Show the preview
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);
  } else {
    // If no file is selected, hide the preview
    imgPreview.style.display = "none";
  }
});
