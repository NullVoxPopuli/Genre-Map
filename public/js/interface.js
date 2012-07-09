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

  $(".interface_options .hide").click(function(){
    if (toolbar.is(":visible") || (sidebar.is(":visible"))){
        toolbar.fadeOut(FADE_OUT_SPEED);
        sidebar.fadeOut(FADE_OUT_SPEED);
        $(this).text("Show Interface");
        setCookie("interface_is_hidden", 1, COOKIE_EXPIRATION);
    } else {
      toolbar.fadeIn(FADE_OUT_SPEED);
      sidebar.fadeIn(FADE_OUT_SPEED);
      $(this).text("Hide Interface");
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
		updateNetwork();
		updateGraph();
	}
  });


  function initUI(){
    if (interfaceIsHidden()){
      toolbar.hide();
      sidebar.hide();
      $(".interface_options .hide").text("Show Interface")

    } else {
      // do nothing, they are visible by default
    }
  }

  function setTheaterForURL(url, autoplay){
    var autoplay = (typeof(autoplay) == "undefined") ? "?autoplay=1" : ""
    var theater = $(".theater");
    var theaterFrame = document.createElement("iframe");

    var tF = $(theaterFrame);
    tF.attr({
      "width": VIDEO_PLAYER_WIDTH,
      "height": VIDEO_PLAYER_HEIGHT,
      "frameborder": 0,
      "allowfullscreen":"",
      "src": url + autoplay
    });

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
    // o : a d3.js node object

    var genre = o.data;
    genre_details.find(".name").html(genre.name);

    // set tracks
    var examples = genre_details.find(".examples");
    examples.empty();
    for(var i = 0; i < genre.tracks.length; i++){
      var current_track = genre.tracks[i];
      var example = $(document.createElement("span"));
      example.attr("data-track", current_track.name);
      example.attr("data-artist", current_track.artist.name);
      example.attr("data-url", current_track.link);
      example.html(i + 1);

      example.click(function(){
        setTheaterForURL($(this).attr("data-url").replace("watch?v=", "embed/"));
      });
      example.appendTo(examples);
    }

    genre_details.find(".description").html(genre.description);
    genre_details.find(".wiki a").attr("href", genre.wikipedia);
    stop_playback.click();
    genre_details.fadeIn();

  }
});