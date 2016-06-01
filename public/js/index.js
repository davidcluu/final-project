$(document).ready(function() {
   //$("h1.fade, h3.fade, button.fade").addClass("animated fadeInUp");
   var $window = $(window);
   var $animate = $(".animate");

   function checkInView() {
      var windowHeight = $window.height();
      var windowTop = $window.scrollTop();
      var windowBottom = (windowHeight + windowTop);

      $.each($animate, function() {
         var $element = $(this);
         var elementHeight = $element.outerHeight();
         var elementTop = $element.offset().top;
         var elementBottom = (elementHeight + elementTop);

         if((elementBottom >= windowTop) && (elementTop <= windowBottom)) {
            $element.addClass("animated fadeInUp");
         }
         else {
            $element.removeClass("animate");
         }
      });
   }

   $window.on("scroll resize", checkInView);
   $window.trigger("scroll");
});
