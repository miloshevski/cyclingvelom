$(document).ready(function () {
  $(".tab-link").click(function (event) {
    event.preventDefault();
    $(".tab-link").removeClass("active");
    $(this).addClass("active");
  });
});
