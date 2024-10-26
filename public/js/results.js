function toggleSideMenu() {
  const menu = $(".side-menu");
  menu.toggleClass("hidden");
}

let lastScrollTop = 0;

$(window).on("scroll", function () {
  let currentScroll = $(this).scrollTop();

  if (currentScroll > lastScrollTop) {
    // Scrolling down, hide the navbar
    $("#navbar").css("top", "-55px");
    $(".side-menu").addClass("hidden");
  } else {
    // Scrolling up, show the navbar
    $("#navbar").css("top", "0px");
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For mobile or negative scrolling
});

function filterResults() {
  const filterValue = document.getElementById("typeFilter").value;
  const resultCards = document.querySelectorAll(".result-card");

  resultCards.forEach((card) => {
    const resultType = card.getAttribute("data-type");

    if (filterValue === "" || filterValue === resultType) {
      card.style.display = "block"; // Show the card
    } else {
      card.style.display = "none"; // Hide the card
    }
  });
}
