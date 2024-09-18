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
