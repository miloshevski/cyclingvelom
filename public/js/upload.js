const fileInput = document.getElementById("imageFiles");
const gallery = document.getElementById("gallery");

// Listen for file selection and display the image preview
fileInput.addEventListener("change", () => {
  gallery.innerHTML = ""; // Clear existing thumbnails
  const files = fileInput.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = (event) => {
      const div = document.createElement("div");
      div.classList.add("img-preview");
      div.innerHTML = `
            <img src="${event.target.result}" alt="Selected Image">
            <button class="remove-btn" onclick="removeImage(${i})">X</button>
          `;
      gallery.appendChild(div);
    };

    reader.readAsDataURL(file); // Read file as a data URL
  }
});

// Function to handle the upload process
async function uploadImages() {
  const formData = new FormData();
  for (const file of fileInput.files) {
    formData.append("images", file); // Append all selected files
  }

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    alert("Images uploaded successfully!");
    window.location.href = "/upload"; // Redirect back to the upload page
  } else {
    alert("Failed to upload images.");
  }
}

// Function to remove an image from the gallery preview
function removeImage(index) {
  const filesArray = Array.from(fileInput.files);
  filesArray.splice(index, 1); // Remove the selected file

  // Reconstruct the file list without the removed file
  const dataTransfer = new DataTransfer();
  filesArray.forEach((file) => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;

  // Trigger the change event to update the gallery
  fileInput.dispatchEvent(new Event("change"));
}

