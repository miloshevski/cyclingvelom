$(document).ready(function () {
  $(".tab-link").click(function (event) {
    $(".tab-link").removeClass("active");
    $(this).addClass("active");
  });
});
// Function to toggle the side menu
function toggleSideMenu() {
  const menu = $(".side-menu");
  menu.toggleClass("hidden");
}

function playSound() {
  const clickSound = new Audio("../majmune.mp3");

  clickSound.currentTime = 0;
  clickSound.play();
}
