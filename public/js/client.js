$(document).ready(function () {
  $(".tab-link").click(function (event) {
    $(".tab-link").removeClass("active");
    $(this).addClass("active");
  });
});
// Create the playSound function
function playSound() {
  // Create an audio element
  const clickSound = new Audio("../majmune.mp3"); // Replace with the actual path to your sound file
  // Play the sound
  clickSound.currentTime = 0; // Reset sound to the beginning
  clickSound.play(); // Play the sound
}
