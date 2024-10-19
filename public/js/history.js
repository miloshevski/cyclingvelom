const mkd = document.getElementById("mkd");
const eng = document.getElementById("eng");

mkd.addEventListener("click", function (event) {
  event.preventDefault();
  document.querySelector(".eng").style.display = "none";
  document.querySelector(".mkd").style.display = "block";
});

eng.addEventListener("click", function (event) {
  event.preventDefault();
  document.querySelector(".mkd").style.display = "none";
  document.querySelector(".eng").style.display = "block";
});

function toggleSideMenu() {
  const menu = document.querySelector(".side-menu");
  menu.classList.toggle("hidden");
}

let lastScrollTop = 0;

window.addEventListener("scroll", function () {
  let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > lastScrollTop) {
    // Scrolling down, hide the navbar
    document.getElementById("navbar").style.top = "-55px";
    document.querySelector(".side-menu").classList.add("hidden");
  } else {
    // Scrolling up, show the navbar
    document.getElementById("navbar").style.top = "0px";
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For mobile or negative scrolling
});
