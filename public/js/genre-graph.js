var FADE_OUT_SPEED = 200;
var VIDEO_PLAYER_WIDTH = 853;
var VIDEO_PLAYER_HEIGHT = 480;
var TRANSITION_DURATION = 500;
var COOKIE_EXPIRATION = 1825;
var CANVAS_HEIGHT = 3000;
var CANVAS_WIDTH = 3000;
var SUPER_GENRE_TEXT = "super_genre"
var SUB_GENRE_TEXT = "sub_genre"
var NON_ELECTRONIC_TEXT = "non_electronic"

// make sure these stay synced with Genre.rb
var SUB_GENRE = 0;
var SUPER_GENRE = 1;
var NON_ELECTRONIC = 2;
// end ruby constants™

var force;
var hiddenNodes = {} // map of index => node
var hiddenLinks = {} // map of super_genre => node

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
    return (c == 1);
  }
else 
  return false;
}

function delCookie(name)
{
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
  var stop_playback = $(".stop_playback");
  var svg_container = $(".svg_container");

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
    // update();
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

  function showGenreDetails(o){
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


  // $(window).resize(resizeSVG);



  /*
    Graph Code

  */
  // http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/


  nodes = {}
  // // Compute the distinct nodes from the links.
  // connections.forEach(function(link) {
  //   link.source = findGenreForName(link.source);
  //   link.target = findGenreForName(link.target);
  // });

  // Compute the distinct nodes from the links.
  links = connections

  // links.forEach(function(link) {
  //   link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  //   link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  // });


  initial_size = getSizeForCanvas()
  var w = initial_size.w,
      h = initial_size.h,
      x = initial_size.x,
      y = initial_size.y,
      node,
      link,
      text;

  force = d3.layout.force()
      .size([CANVAS_WIDTH, CANVAS_HEIGHT])
      .linkDistance(70)
      .charge(-700)
      .friction(0.7)
      .on("tick", tick)
     .start();


  var svg = d3.select(".svg_container").append("svg:svg");

  resizeSVG(); // fit to window
  update(); // draw
  svg_container.scrollLeft($("svg").width() / 2 - svg_container.width() / 2);
  svg_container.scrollTop($("svg").height() / 2 - svg_container.height() / 2);


  // redraw everything
  // - mainly for collapsing
  update_graph = function(){
    update();
  }

  function update(){

    force
      .nodes(genre_nodes)
      .links(connections)
      .start();

    // update the links
    link = svg.selectAll("path")
      .data(connections, function(d) {return d.target.id});

    // Enter new links
    link.enter().insert("svg:path", ".node")
      .attr("class", function(d) { 
        return "link " + d.type + " " + d.source.kind + " " + d.source.super_genre + " " + d.target.super_genre; })
      // .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    // exit any old links
    link.exit().remove();

    // update the nodes
    node = svg.selectAll("circle.node")
      .data(force.nodes())
      // change color?

    // enter new nodes
    node.enter().append("svg:circle")
      .attr("r", function(d) { return genreRadius(d); })
      .call(force.drag)
      // .on("dblclick", function(d) { 
      //     showGenreDetails(d);
      // })
      .on("click", function(d){
          expandOrCollapse(d);
          update();
      })
      .attr("class", function(d) {
        return "node " + d.kind + " " + d.data.name.replace(" ", "").toUpperCase() + " " + d.super_genre;
      });

    // exit old nodes
    node.exit().remove();


    // // // Per-type markers, as they don't inherit styles.
    // var markers = svg.append("svg:defs").selectAll("marker")
    //     .data(["direct"])
    //     .enter().append("svg:marker")
    //     .attr("id", String)
    //     .attr("viewBox", "0 -5 10 10")
    //     .attr("refX", 15)
    //     .attr("refY", -1.5)
    //     .attr("markerWidth", 6)
    //     .attr("markerHeight", 6)
    //     .attr("orient", "auto")
    //   .append("svg:path")
    //     .attr("d", "M0,-5L10,0L0,5");
       


    // update the text
    text = svg.selectAll("g")
      .data(force.nodes());

    // Enter new text
    text.enter().append("svg:g");
    text.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", function(d) {return textOffsetY(d); })
        .attr("class", function(d){
          if (d == undefined) return;
  
          return "shadow " + d.super_genre
        })
        .text(function(d) {     
          if (d == undefined) return;
          return d.data.name; });


    text.append("svg:text")
        .attr("text-anchor", "middle")  
        .attr("x", 0)
        .attr("y", function(d) {return textOffsetY(d); })
        .attr("class", function(d){
          if (d == undefined) return;

          return d.super_genre
        })
        .text(function(d) { 
              if (d == undefined) return;

          return d.data.name; });


    // exit old text
    text.exit().remove();


    // var text = svg.append("svg:g").selectAll("g")
    //     .data(force.nodes())
    //   .enter().append("svg:g");

    // // A copy of the text with a thick white stroke for legibility.
    // text.append("svg:text")
    //     .attr("text-anchor", "middle")
    //     .attr("x", 0)
    //     .attr("y", function(d) {return textOffsetY(d); })
    //     .attr("class", "shadow")
    //     .text(function(d) { return genres[d.name].name; });

    // text.append("svg:text")
    //     .attr("text-anchor", "middle")  
    //     .attr("x", 0)
    //     .attr("y", function(d) {return textOffsetY(d); })
    //     .text(function(d) { return genres[d.name].name; });


  }

  function expandOrCollapse(d){
    if (d.kind != SUPER_GENRE_TEXT) return; // abort if sub_genre is clicked

    // find what class of nodes to show / hide
    var super_genre = d.data.name;
    // check if collapsed 
    if (d.collapsed){
      // current state is collapsed. show all the necessary nodes
      // loop through hiddenNodes, checking if they belong to the super_genre
      // and then restoring them
      var addToConections = [];
      for (var key in hiddenNodes) {
         var obj = hiddenNodes[key];
         // hiddenNodes is a map of index => object
          // put it back in the genre_nodes array
          genre_nodes[obj.index] = obj;
          // delete it from the hiddenNodes hash
          delete hiddenNodes[obj.index];
      }

      // also restore all of the connections
      addToConections = hiddenLinks[super_genre];
      connections.addAll(addToConections);

      // then delete the hidden links for the  super_genre
      delete hiddenLinks[super_genre];

      d.collapsed = false
    } else {
      // current state is uncollapsed, so hide all the necessary nodes

      // loop through genre_nodes, delete ones corresponding to super_genre
      // while adding them to hiddenNodes so we can restore them.
      var lastSubGenreIndex = -1;
      var findingIndices = true
      var maxNumberOfNodes = genre_nodes.length;
      var currentConnection;
      var linksToHide = []
      while(findingIndices){
        lastSubGenreIndex = genre_nodes.indexOfObjectForField("super_genre", super_genre, lastSubGenreIndex + 1);
        if (lastSubGenreIndex > -1 || lastSubGenreIndex >= maxNumberOfNodes){
          // add to hiddenNodes
          hiddenNodes[lastSubGenreIndex] = genre_nodes[lastSubGenreIndex];
          // javascript copied data upon assignment, so we don't need to worry about things getting 
          // messed up when we delete from genre_nodes

          // remove from genre_nodes
          delete genre_nodes[lastSubGenreIndex];

          // now we also need to add all the connections to our hiddenLinks object
          // then remove them from the "connections" variable, so they don't get rendered
          // exactly like with the nodes
          hiddenLinks[super_genre] = []
          for (var i = 0; i < connections.length; i++){
            currentConnection = connections[i];
            // check if current connection references our current node
            if (currentConnection == undefined) continue;
            if (currentConnection.source.index == lastSubGenreIndex || currentConnection.target.index == lastSubGenreIndex){
              // add to hiddenLinks
              linksToHide.push(currentConnection);
              // remove from connections
              delete connections[i];
            }
          }
          hiddenLinks[super_genre] = linksToHide;

        } else {
          break;
          // reached end of nodes structure
        }
      }

      // set the cicle's collapsed state to true, so we don't try to delete things that "don't exist"
      d.collapsed = true
    }

    // clean up
    connections.clean(undefined);
  }


  function tick() {
    link.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "L"+ d.target.x + "," + d.target.y;
    });

    node.attr("transform", function(d) {
      if (d == undefined) return;
      return "translate(" + d.x + "," + d.y + ")";
    });

    text.attr("transform", function(d) {
      if (d == undefined) return;
      return "translate(" + d.x + "," + d.y + ")";
    });
  };


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
    var kind = d.data.kind
    if (kind == SUPER_GENRE){ radius = 25; } 
    else { radius = 6; }
    return radius;
  }

  function textOffsetY(d){
    if (d == undefined) return;
    var offsetY = 0;
    var kind = d.data.kind
    if (kind == SUPER_GENRE){ offsetY = 4; } 
    else { offsetY = 16; }
    return offsetY;
  }
  function findGenreForName(name){
    for (var i = 0; i < nodes.length; i++){
      if (genre_nodes[i].name == name){
        return i;
      }
    }
  }

  function resizeSVG(){
    var size = getSizeForCanvas();
    $(".svg_container").animate({
      "top": size.y,
      "left": size.x,
      // "width": size.w,
      // "height": size.h
    });

  }

})
