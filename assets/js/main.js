$(function () {
  'use strict';

  /* -------- Scroll to top button ------- */
  $(".top").click(function() {
    $("html, body")
      .stop()
      .animate({ scrollTop: 0 }, "slow", "swing");
  });

  $(window).scroll(function() {
    if ($(this).scrollTop() > $(window).height()) {
      $(".top").addClass("is-active");
    } else {
      $(".top").removeClass("is-active");
    }
  });

  // Cache variables for increased performance on devices with slow CPUs.
  var flexContainer = $('div.flex-container')
  var searchBox = $('.search-box')
  var searchClose = $('.search-icon-close')
  var searchInput = $('#search-input')
  var waiting;

  // Menu button
  $('.menu-icon, .menu-icon-close').click(function (e) {
    e.preventDefault()
    e.stopPropagation()
    flexContainer.toggleClass('active')
    if (flexContainer.hasClass('opaque')){
      hideLayer();
    } else {
      setTimeout(function () {
        flexContainer.addClass('opaque');
        flexContainer.removeClass('transparent');
      }, 10);
    }
  })

  // Click outside of menu to close it
  flexContainer.click(function (e) {
    if (flexContainer.hasClass('active') && e.target.tagName !== 'A') {
      if (e.target.className.includes('night')) {
        clearTimeout(waiting);
        waiting = setTimeout(function() {
          hideLayer();
        }, 1000);
      } else {
        hideLayer();
      }
    }
  })

  function hideLayer () {
    flexContainer.removeClass('opaque');
    flexContainer.addClass('transparent');
    flexContainer[0].addEventListener('transitionend', function(e) {
      flexContainer.removeClass('active');
    }, {capture: false, once: true, passive: false});
  }

  // Press Escape key to close menu
  $(window).keydown(function (e) {
    if (e.key === 'Escape') {
      if (flexContainer.hasClass('active')) {
        hideLayer();
      } else if (searchBox.hasClass('search-active')) {
        searchBox.removeClass('search-active');
      }
    }
  })

  // Search button
  $('.search-icon').click(function (e) {
    e.preventDefault()
    if($('.search-form.inline').length == 0){
        searchBox.toggleClass('search-active')
    }
    searchInput.focus()
    if (searchBox.hasClass('search-active')) {
      searchClose.click(function (e) {
    		e.preventDefault()
    		searchBox.removeClass('search-active')
    	})
    }
  })
});
