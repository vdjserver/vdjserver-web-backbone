$(document).ready (function () {

  $(function () {
      // initializing popovers an tooltips
      $('[data-toggle="popover"]').popover();
      console.log("popover initialized")

      $('[data-toggle="tooltip"]').tooltip();
      console.log("tooltip initialized");
  })
});
