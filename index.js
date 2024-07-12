$(document).ready(function () {
  $(".tab-link").click(function (event) {
    $(".tab-link").removeClass("active");
    $(this).addClass("active");
  });
});
