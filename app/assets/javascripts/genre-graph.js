var FADE_OUT_SPEED = 200;
var VIDEO_PLAYER_WIDTH = 853;
var VIDEO_PLAYER_HEIGHT = 480;
var TRANSITION_DURATION = 500;
var COOKIE_EXPIRATION = 1825;

// make sure these stay synced with Genre.rb
var SUB_GENRE = 0;
var SUPER_GENRE = 1;
// end ruby constants™


/*
  COOKIE UTILS - by w3c schools
*/

function getCookie(c_name)
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
  {
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}

function setCookie(c_name,value,exdays)
{
var exdate=new Date();
exdate.setDate(exdate.getDate() + exdays);
var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
document.cookie=c_name + "=" + c_value;
}

function interfaceIsHidden()
{
var c=getCookie("interface_is_hidden");
if (c!=null && c!="")
  {
    return c;
  }
else 
  return false;
}


/*
  END COOKIE UTILS
*/

$(function(){
/*
  Interface Code
*/

var toolbar = $(".toolbar"); 
var sidebar = $(".information");
var toolbar_height = toolbar.outerHeight();
var sidebar_width = sidebar.outerWidth();
var genre_details = $(".genre_details");

initUI();


$(".genre > .attribute[data-attr='name']").click(function(){
  var parent = $(this).parent();
  if (parent.hasClass("active")){
    parent.find(".details").hide();
    parent.removeClass("active");
    // remove the theater iframe we don't use a ton of ram
    $(".theater").html("");
  } else {
    $(this).parent().find(".details").show();
    $(".genre").removeClass("active");
    $(this).parent().addClass("active");
  }
});

$(".genre_details .close").click(function(){
  $(".genre_details").fadeOut(FADE_OUT_SPEED);
  $(".theater").html("");
});

$(".interface_options .hide").click(function(){
  if (toolbar.is(":visible") || (sidebar.is(":visible"))){
      toolbar.fadeOut(FADE_OUT_SPEED);
      sidebar.fadeOut(FADE_OUT_SPEED);
      $(this).text("Show Interface")
      setCookie("interface_is_hidden", true, COOKIE_EXPIRATION);
  } else {
    toolbar.fadeIn(FADE_OUT_SPEED);
    sidebar.fadeIn(FADE_OUT_SPEED);
    $(this).text("Hide Interface")
    setCookie("interface_is_hidden", false, COOKIE_EXPIRATION);   
  }
  setTimeout(resizeSVG, 250);
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

function resizeSVG(){
  var size = getSizeForCanvas();
  $("svg").animate({
    "top": size.y,
    "left": size.x,
    "width": size.w,
    "height": size.h
  });
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
}

function makeCenter(obj){
  // obj : jQuery object
  obj.css({
    "top": $(window).height() /2 - obj.height() / 2,
    "left": $(window).width() / 2 - obj.width() / 2,
  })
}

function showGenreDetails(o){
  // o : a d3.js node object

  var genre = genres[o.name];
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

  genre_details.fadeIn();

}

$(window).resize(resizeSVG);

/*
  Graph Code

*/
// http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/


function getSizeForCanvas(){
  var w = $(window).width();
  var h = $(window).height();
  var x = 0;
  var y = 0;
  var toolbar_visible = typeof(toolbar) == "undefined" ? false : toolbar.is(":visible");
  var sidebar_visible = typeof(sidebar) == "undefined" ? false : sidebar.is(":visible");
  if (sidebar_visible) x = sidebar_width;
  if (toolbar_visible) y = toolbar_height
  return {
    x: x,
    y: y,
    w: w - x,
    h: h - y
  }
}

function genreRadius(d){
  // d : d3 node object
  var radius;
  genre = genres[d.name];
  if (genre.kind == SUPER_GENRE){ radius = 15; } 
  else { radius = 6; }
  return radius;
}

function genreKind(d){
  // d : d3 node object
  genre = genres[d.name];
  result = (genre.kind == SUPER_GENRE) ? "super_genre" : "sub_genre";
  return result;
}

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

initial_size = getSizeForCanvas()
var w = initial_size.w;
    h = initial_size.h;
    x = initial_size.x;
    y = initial_size.y;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .linkDistance(80)
    .charge(-1000)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg:svg");
resizeSVG();


// Per-type markers, as they don't inherit styles.
svg.append("svg:defs").selectAll("marker")
    .data(["direct"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")
    .attr("r", function(d) { return genreRadius(d); })
    .call(force.drag)
    .on("click", function(d) { showGenreDetails(d) })
    .attr("class", function(d) {return genreKind(d);});

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return genres[d.name].name; });

text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return genres[d.name].name; });

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,0 " + d.target.x + "," + d.target.y;
  });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}



})
