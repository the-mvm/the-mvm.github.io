---
layout: null
---
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

  // Menu Settings
  $('.menu-icon, .menu-icon-close').click(function (e) {
    e.preventDefault()
    e.stopPropagation()
    flexContainer.toggleClass('active')
  })

  // Click outside of menu to close it
  flexContainer.click(function (e) {
    if (flexContainer.hasClass('active') && e.target.tagName !== 'A') {
      flexContainer.removeClass('active')
    }
  })

  // Press Escape key to close menu
  $(window).keydown(function (e) {
    if (e.key === 'Escape') {
      if (flexContainer.hasClass('active')) {
        flexContainer.removeClass('active')
      } else if (searchBox.hasClass('search-active')) {
        searchBox.removeClass('search-active')
      }
    }
  })

  // Search Settings
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

  {% if page.toc %}
    var spy = new Gumshoe("#toc-content a", {
      navClass:"active",
      contentClass:"underline",
      nested:0,
      nestedClass:"active",
      offset:20,
      reflow:1,
      events:1
    });

    var coll = document.getElementsByClassName("toc-item-1");
    var i;
    var chevron_up = "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 512\"><path fill=\"currentColor\" d=\"M136.5 185.1l116 117.8c4.7 4.7 4.7 12.3 0 17l-7.1 7.1c-4.7 4.7-12.3 4.7-17 0L128 224.7 27.6 326.9c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17l116-117.8c4.7-4.6 12.3-4.6 17 .1z\"></path></svg>"
    var chevron_down = "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 512\"><path fill=\"currentColor\" d=\"M119.5 326.9L3.5 209.1c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0L128 287.3l100.4-102.2c4.7-4.7 12.3-4.7 17 0l7.1 7.1c4.7 4.7 4.7 12.3 0 17L136.5 327c-4.7 4.6-12.3 4.6-17-.1z\"></path></svg>"
    for (i = 0; i < coll.length; i++) {
      if (coll[i].childElementCount > 1) {
        sign = document.createElement('div');
        sign.className = "toc-sign";
        sign.innerHTML = chevron_down;
        coll[i].insertBefore(sign, coll[i].childNodes[0].nextSibling);
        coll[i].addEventListener("click", function() {
          this.classList.toggle("active");
          var content = this.lastElementChild;
          if (content.style.maxHeight){
            content.style.maxHeight = null;
            this.firstElementChild.nextSibling.innerHTML = chevron_down;
          } else {
            content.style.maxHeight = content.scrollHeight + "px";
            this.firstElementChild.nextSibling.innerHTML = chevron_up;
          }
        });
      }
    }
  {% endif %}

  {% if page.infinite %}
    var postURLs,
        isFetchingPosts = false,
        shouldFetchPosts = true;
    
    // Load the JSON file containing all URLs
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    // If a tag was passed as a url parameter then use it to filter the urls
    if (urlParams.has('tag')){
      const tag = urlParams.get('tag');
      document.getElementById(tag).classList.toggle('hidden');
      $.getJSON('./posts-by-tag.json', function(data) {
          let tag_item = data.find(el => el.tag === tag);
          postURLs = tag_item["posts"];
          // If there aren't any more posts available to load than already visible, disable fetching
          if (postURLs.length <= postsToLoad)
          disableFetching();
      });
    } else {
        $.getJSON('./all-posts.json', function(data) {
          postURLs = data["posts"];
          // If there aren't any more posts available to load than already visible, disable fetching
          if (postURLs.length <= postsToLoad)
            disableFetching();
        });
    }

    var postsToLoad = $(".tag-master:not(.hidden) .post-list").children().length,
        loadNewPostsThreshold = 10;

    // If there's no spinner, it's not a page where posts should be fetched
    if ($(".spinner").length < 1)
      shouldFetchPosts = false;
    
    // Are we close to the end of the page? If we are, load more posts
    $(window).scroll(function(e){
      if (!shouldFetchPosts || isFetchingPosts) return;
      
      var windowHeight = $(window).height(),
          windowScrollPosition = $(window).scrollTop(),
          bottomScrollPosition = windowHeight + windowScrollPosition,
          documentHeight = $(document).height();
      
      // If we've scrolled past the loadNewPostsThreshold, fetch posts
      if ((documentHeight - loadNewPostsThreshold) < bottomScrollPosition) {
        fetchPosts();
      }
    });
    
    // Fetch a chunk of posts
    function fetchPosts() {
      // Exit if postURLs haven't been loaded
      if (!postURLs) return;
      
      isFetchingPosts = true;
      
      // Load as many posts as there were present on the page when it loaded
      // After successfully loading a post, load the next one
      var loadedPosts = 0,
          postCount = $(".tag-master:not(.hidden) .post-list").children().length,
          callback = function() {
            loadedPosts++;
            var postIndex = postCount + loadedPosts;
            
            if (postIndex > postURLs.length-1) {
              disableFetching();
              return;
            }
            
            if (loadedPosts < postsToLoad) {
              fetchPostWithIndex(postIndex, callback);
            } else {
              isFetchingPosts = false;
            }
          };
      
      fetchPostWithIndex(postCount + loadedPosts, callback);
    }
    
    function fetchPostWithIndex(index, callback) {
      var postURL = postURLs[index];
      
      $.get(postURL, function(data) {
        $(data).find(".post").appendTo(".tag-master:not(.hidden) .post-list");
        callback();
      });
    }
    
    function disableFetching() {
      shouldFetchPosts = false;
      isFetchingPosts = false;
      $(".spinner").fadeOut();
    }
  {% endif %}

  {% if page.layout == "post" %}
    if (document.getElementById('comment-curtain') == null){
      document.getElementById('disqus_thread').classList.toggle('show')
    }
    function toggle_comments(){
        document.getElementById('comment-curtain').classList.toggle('hide')
        document.getElementById('disqus_thread').classList.toggle('show')
    }
    $(".share-hover.side").on("mouseover", function() {
      document.getElementById('sidebar-icons').classList.add('show');
      setTimeout(function () {
          document.getElementById('sidebar-icons').classList.add('opaque');
          document.getElementById('sidebar-icons').classList.remove('transparent');
      }, 10);
    }).on("mouseleave", function() {
      document.getElementById('sidebar-icons').classList.add('transparent');
      document.getElementById('sidebar-icons').classList.remove('opaque');
      document.getElementById('sidebar-icons').addEventListener('transitionend', function(e) {
        document.getElementById('sidebar-icons').classList.remove('show');
      }, {capture: false, once: true, passive: false});
    });
    function copyToClipboard() {
      navigator.clipboard.writeText('{{ site.url }}{{ page.url }}').then(function() {
      alerts = document.getElementsByClassName('alert')
      for (i=0; i < alerts.length; i++){
        alerts[i].innerHTML='\u00ABlink copied\u00BB';
        setTimeout((function(i){ return function(){alerts[i].innerHTML='';}})(i), 1600 );
      };
      }, function() {
        prompt("Unable to copy, please use this link:", "{{ site.url }}{{ page.url }}");
      });
    }
  {% endif %}
});
