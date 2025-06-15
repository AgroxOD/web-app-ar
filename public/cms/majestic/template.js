(function ($) {
  'use strict';
  $(function () {
    var body = $('body');
    var sidebar = $('.sidebar');

    //Add active class to nav-link based on url dynamically
    //Active class can be hard coded directly in html file also as required

    function addActiveClass(element) {
      if (current === '') {
        //for root url
        if (element.attr('href').indexOf('index.html') !== -1) {
          element.parents('.nav-item').last().addClass('active');
          if (element.parents('.sub-menu').length) {
            element.closest('.collapse').addClass('show');
            element.addClass('active');
          }
        }
      } else {
        //for other url
        if (element.attr('href').indexOf(current) !== -1) {
          element.parents('.nav-item').last().addClass('active');
          if (element.parents('.sub-menu').length) {
            element.closest('.collapse').addClass('show');
            element.addClass('active');
          }
          if (element.parents('.submenu-item').length) {
            element.addClass('active');
          }
        }
      }
    }

    var current = location.pathname
      .split('/')
      .slice(-1)[0]
      .replace(/^\/|\/$/g, '');
    $('.nav li a', sidebar).each(function () {
      var $this = $(this);
      addActiveClass($this);
    });

    //Close other submenu in sidebar on opening any

    sidebar.on('show.bs.collapse', '.collapse', function () {
      sidebar.find('.collapse.show').collapse('hide');
    });

    //Change sidebar

    $('[data-toggle="minimize"]').on('click', function () {
      body.toggleClass('sidebar-icon-only');
    });

    //checkbox and radios
    $('.form-check label,.form-radio label').append(
      '<i class="input-helper"></i>',
    );

    // Remove pro banner on close

    var proBanner = document.querySelector('#proBanner');
    var navbar = document.querySelector('.navbar');
    var wrapper = document.querySelector('.page-body-wrapper');
    var closeBtn = document.querySelector('#bannerClose');

    if (proBanner && navbar) {
      if ($.cookie('majestic-free-banner') != 'true') {
        proBanner.classList.add('d-flex');
        navbar.classList.remove('fixed-top');
      } else {
        proBanner.classList.add('d-none');
        navbar.classList.add('fixed-top');
      }

      if ($(navbar).hasClass('fixed-top')) {
        wrapper && wrapper.classList.remove('pt-0');
        navbar.classList.remove('pt-5');
      } else {
        wrapper && wrapper.classList.add('pt-0');
        navbar.classList.add('pt-5');
        navbar.classList.add('mt-3');
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          proBanner.classList.add('d-none');
          proBanner.classList.remove('d-flex');
          navbar.classList.remove('pt-5');
          navbar.classList.add('fixed-top');
          wrapper && wrapper.classList.add('proBanner-padding-top');
          navbar.classList.remove('mt-3');
          var date = new Date();
          date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
          $.cookie('majestic-free-banner', 'true', { expires: date });
        });
      }
    }
  });
})(jQuery);
