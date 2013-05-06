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

  $(".genre_details .close").click(function(){
    $(".genre_details").fadeOut(FADE_OUT_SPEED);
  });

  $(".information .close").unbind("click");
  $(".information .close").click(function(){
    $(".information").fadeOut(FADE_OUT_SPEED);
  });

  $(".stop_playback").click(function(){
      $(".theater").html("");
      $(this).fadeOut();
  });

  /*
    This version of jQueryUI only include .draggable
  */
  $(".genre_details .content").draggable({
    handle: ".genre_details .content .header"
  });

  $(".information .content").draggable({
    handle: ".information .header"
  });

  $(".interface_options .hide").click(function(){
    if (toolbar.is(":visible") || (sidebar.is(":visible"))){
        toolbar.fadeOut(FADE_OUT_SPEED);
        sidebar.fadeOut(FADE_OUT_SPEED);
    } else {
      toolbar.fadeIn(FADE_OUT_SPEED);
      sidebar.fadeIn(FADE_OUT_SPEED);
    }
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

  function makeCenter(obj){
    // obj : jQuery object
    obj.css({
      "top": $(window).height() /2 - obj.height() / 2,
      "left": $(window).width() / 2 - obj.width() / 2,
    })
  }

  showGenreDetails = function(o){
    var genre = o;
    if (genre_details.find(".name").html() == genre.name){
      return; // current genre
    }
    genre_details.find(".name").html(genre.name);

    // add track examples
    getTracksForGenre(o.name);

    var url = "http://en.wikipedia.com" + o.wiki;

    if (genre.wikipedia == ""){
      genre_details.find(".wiki").hide();
    } else {
      $("#description").attr("src", url);

      genre_details.find(".wiki").show();
    }
    genre_details.find(".wiki a").attr("href", url);
    stop_playback.click();
    genre_details.fadeIn();

  }
});