var VIDEO_PLAYER_WIDTH = 853;
var VIDEO_PLAYER_HEIGHT = 480;
var SOUNDCLOUD_WIDTH = "100%"
var SOUNDCLOUD_HEIGHT = "166"
var YEARS_PADDING_LEFT = 150;
var YEARS_PADDING_RIGHT = 50;

$(function(){

  var toolbar = $(".toolbar"); 
  var sidebar = $(".information");
  var toolbar_height = toolbar.outerHeight();
  var sidebar_width = sidebar.outerWidth();
  var genre_details = $(".genre_details");
  var stop_playback = $(".stop_playback");

  initUI();

  $(".genre_details .close").click(function(){
    $(".genre_details").fadeOut(FADE_OUT_SPEED);
  });

  $(".stop_playback").click(function(){
      $(".theater").html("");
      $(this).fadeOut();
  });


  /*
    This version of jQueryUI only include .draggable
  */
  $(".genre_details .content").draggable({
    handle: ".genre_details .content .header",
    drag: function(){
      $(".genre_details .background").fadeOut();
    }
  });

  $(".interface_options .hide").click(function(){
    if (toolbar.is(":visible") || (sidebar.is(":visible"))){
        toolbar.fadeOut(FADE_OUT_SPEED);
        sidebar.fadeOut(FADE_OUT_SPEED);
        $(this).text("Show UI");
        setCookie("interface_is_hidden", 1, COOKIE_EXPIRATION);
    } else {
      toolbar.fadeIn(FADE_OUT_SPEED);
      sidebar.fadeIn(FADE_OUT_SPEED);
      $(this).text("Hide UI");
      setCookie("interface_is_hidden", 0, COOKIE_EXPIRATION);   
    }
    setTimeout(resizeSVG, 250);
  });

  $(".repulsion_slider input").change(function(){
    force.charge($(this).val() * -1);
    updateGraph();
  });
  $(document).bind("keydown",  function(event){
      if (event.which == 27) { // 27 is escape
          $(".genre_details .close").click();
      }
  });

  $("#search").bind("keyup", function(e){
  	if(e.keyCode == 13){
	  	// searchText defined in graph.js
		searchText = $(this).val();
		updateGraph();
	}
  });


  function initUI(){
    if (interfaceIsHidden()){
      toolbar.hide();
      sidebar.hide();
      $(".interface_options .hide").text("Show UI")

    } else {
      // do nothing, they are visible by default
    }
  }

  function setTheaterForURL(url, autoplay){
    var autoplay = (typeof(autoplay) == "undefined") ? "?autoplay=1" : ""
    var theater = $(".theater");
    var tf, theaterFrame;
    if (url.indexOf("youtube") != -1){
      theaterFrame = document.createElement("iframe");

      tF = $(theaterFrame);

      tF.attr({
        "width": VIDEO_PLAYER_WIDTH,
        "height": VIDEO_PLAYER_HEIGHT,
        "frameborder": 0,
        "allowfullscreen":"",
        "src": url.replace("watch?v=", "embed/") + autoplay
      });
    } else {
        //  vimeo and soundcloud require embedding, and cutting up the URL of their 
        // main pages to derive the embed code isn't entrely straight forward

        // we have embed code
        // convert to jQuery object
        theaterFrame = $(document.createElement("div")).html(url)
        var frame = theaterFrame.find("iframe");
        var src = frame.attr("src");
        if (src.indexOf("soundcloud") != -1){
          frame.attr("src", src + "&auto_play=true");
        } else if (src.indexOf("vimeo") != -1){
          frame.attr("src", src + "&autoplay=true");
          frame.attr("width", VIDEO_PLAYER_WIDTH);
          frame.attr("height", VIDEO_PLAYER_HEIGHT);
        }
        tF = theaterFrame.contents();
    }

    theater.html(tF);
    theater.show();
    stop_playback.show();
  }

  function makeCenter(obj){
    // obj : jQuery object
    obj.css({
      "top": $(window).height() /2 - obj.height() / 2,
      "left": $(window).width() / 2 - obj.width() / 2,
    })
  }

  showGenreDetails = function(o){
    var genre = o;
    genre_details.find(".name").html(genre.name);
    // genre_details.find(".background").show();
    // genre_details.find(".content").attr("style", "");
    // set tracks
    var examples = genre_details.find(".examples");
    examples.empty();

    // if (genre.tracks.length == 0) {
    //   $(".example_title").text("");
    // } else {
    //   $(".example_title").text("Examples:");
    // }
    // for(var i = 0; i < genre.tracks.length; i++){
    //   var current_track = genre.tracks[i];
    //   var example = $(document.createElement("span"));
    //   example.attr("data-track", current_track.name);
    //   example.attr("data-artist", current_track.artist.name);
    //   example.attr("data-url", current_track.link);
    //   example.html(i + 1);

    //   example.click(function(){
    //     setTheaterForURL($(this).attr("data-url"));
    //   });
    //   example.appendTo(examples);
    // }

    if (genre.wikipedia == ""){
      genre_details.find(".wiki").hide();
    } else {
      var iframe = genre_details.find("iframe");
      iframe.attr("src", "http://en.wikipedia.com" + o.wiki);

      // fix css 
      var content = iframe.contents();
      content.find('#mw-panel, #mw-head, #mw-page-base, #mw-head-base').css({
        display: "none"    
      });
      content.find("#content").css({
        margin: 0
      })


      genre_details.find(".wiki").show();
    }
    genre_details.find(".wiki a").attr("href", genre.wikipedia);
    stop_playback.click();
    genre_details.fadeIn();

  }
});