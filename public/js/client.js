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
let lastScrollTop = 0;

$(window).on("scroll", function () {
  let currentScroll = $(this).scrollTop();

  if (currentScroll > lastScrollTop) {
    // Scrolling down, hide the navbar
    $("#navbar").css("top", "-55px");
  } else {
    // Scrolling up, show the navbar
    $("#navbar").css("top", "0px");
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For mobile or negative scrolling
});

let currentIndex = 0;

function scrollResults() {
  const container = document.getElementById("resultsContainer");
  const cards = document.querySelectorAll(".result-card");
  const totalCards = cards.length;

  // Calculate the width of one card (assuming they are all the same width)
  const cardWidth = cards[0].offsetWidth;

  // Increment the index and reset to 0 if at the end
  currentIndex = (currentIndex + 1) % totalCards;

  // Apply the translation to the container
  container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}
