$(document).ready(function () {
  $(".tab-link").click(function (event) {
    $(".tab-link").removeClass("active");
    $(this).addClass("active");
  });
});
// const images = [
//   'url("slike/slika1.png")',
//   'url("slike/slika2.jpg")',
//   'url("slike/FB_IMG_1688924388168.jpg")',
//   'url("slike/FB_IMG_1693505139166.jpg")',
//   'url("slike/FB_IMG_1684913910545.jpg")',
//   'url("slike/FB_IMG_1684913920560.jpg")',
//   'url("slike/FB_IMG_1687167745381.jpg")',
//   'url("slike/FB_IMG_1693326351042.jpg")',
//   'url("slike/FB_IMG_1715625450000.jpg")',
//   'url("slike/FB_IMG_1715625537564.jpg")',
//   'url("slike/FB_IMG_1715625562179.jpg")',
//   'url("slike/FB_IMG_1715625580882.jpg")',
//   'url("slike/FB_IMG_1715625620142.jpg")',
//   'url("slike/FB_IMG_1715625634202.jpg")',
//   'url("slike/FB_IMG_1715625648823.jpg")',
// ];

// let currentIndex = 0;

// function changeBackground() {
//   const backgroundDiv = document.querySelector("#home");
//   backgroundDiv.style.backgroundImage = images[currentIndex];
//   currentIndex = (currentIndex + 1) % images.length;
// }

// setInterval(changeBackground, 3000);

// // Initialize the first background
// changeBackground();
