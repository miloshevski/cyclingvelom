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
