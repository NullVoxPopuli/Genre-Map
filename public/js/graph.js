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

// force diagram object
var force; 
// master list of connections
// the source and target fields for each entry corresponds to a node's database id
var connections = []; 
// master list of nodes
// - the name field for each entry here is the database id
var genre_nodes = []; 
// current nodes
var nodes = [];
 // current connections 
var links = [];
// list of names of the super genres that are to be hidden
var hiddenSuperGenres = [] 
// text from the search field
var searchText = "" 


// cotainer that allows scrolling
var svg_container = $(".svg_container");


$(function(){
  updateNetwork = function(){
    console.log("updating network...");
    /*
     Things we need to do:
      - Hide any nodes / links that are associated wit the hidden super genres
      - Of the nodes that are visible, filter any by name for searching
      - Generate The list of links based on the current list of nodes
      - set current connections to "links"
      - set current nodes to "nodes"
    */

    // clear structures to be graphed
    nodes.clear;
    links.clear;    

    // loop over genre_nodes, adding nodes as needed
    var currentNode, nodeName, parentName;
    for (var i = 0; i < genre_nodes.length; i++){
      currentNode = genre_nodes[i];
      nodeName = currentNode.data.name.toUpperCase();
      parentName = currentNode.super_genre;
      searchText = searchText.toUpperCase();

      // by default, we want to include whatever the searchText tells up to
      // and to exclude anything in "hiddenSuperGenres"
      if (nodeName.indexOf(searchText) != -1 && (hiddenSuperGenres.indexOf(parentName) == -1) || parentName == ""){
        nodes.push(currentNode);
      }
    }

    // compute the links array
    //  - must lookup the new positions
    //  - loop over each connection, and see if both source and target are visible
    var currentConnection, sourceID, targetID, sourceIndex, targetIndex;
    for (var i = 0; i < connections.length; i++){

      currentConnection = connections[i];
      sourceID = currentConnection.source;
      targetID = currentConnection.target;
      sourceIndex = nodes.indexOfObjectForField("name", sourceID);
      targetIndex = nodes.indexOfObjectForField("name", targetID);

      // both most exist in nodes
      if (sourceIndex != -1 && targetIndex != -1)
        links.push({"source":sourceIndex, "target":targetIndex});
    }
  }

  // redraw everything
  updateGraph = function(){

    force
      .nodes(nodes)
      .links(links)
      .start();

    // update the links
    link = svg.selectAll("path")
      .data(links, function(d) {return d.target.id});

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
      .on("dblclick", function(d) { 
          showGenreDetails(d);
      })
      .on("click", function(d){
          expandOrCollapse(d);
          updateNetwork();
          updateGraph();
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
          return "shadow " + d.super_genre
        })
        .text(function(d) {     
          return d.data.name; });


    text.append("svg:text")
        .attr("text-anchor", "middle")  
        .attr("x", 0)
        .attr("y", function(d) {return textOffsetY(d); })
        .attr("class", function(d){
          return d.super_genre
        })
        .text(function(d) { 
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
  updateNetwork(); // re-gen the data
  updateGraph(); // draw
  svg_container.scrollLeft($("svg").width() / 2 - svg_container.width() / 2);
  svg_container.scrollTop($("svg").height() / 2 - svg_container.height() / 2);


  function expandOrCollapse(d){
    if (d.kind != SUPER_GENRE_TEXT) return; // abort if sub_genre is clicked

    // find what class of nodes to show / hide
    var genre_name = d.data.name;
    // check if collapsed 
    var indexOfGenre;
    if ((indexOfGenre = hiddenSuperGenres.indexOf(genre_name)) != -1){
      // collapsed - lets uncollapse it!

      // remove from hiddenSuperGenres, 
      // so that it will uncollapse when updateNetwork() is called again
      delete hiddenSuperGenres[indexOfGenre];
      hiddenSuperGenres.clean(); // removes undefined values
    } else {
      // not collapsed.... so.. collapse it 
      hiddenSuperGenres.push(genre_name)
    }
  }


  function tick() {
    link.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "L"+ d.target.x + "," + d.target.y;
    });

    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    text.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  };

  var toolbar = $(".toolbar"); 
  var sidebar = $(".information");
  var toolbar_height = toolbar.outerHeight();
  var sidebar_width = sidebar.outerWidth();
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
    var offsetY = 0;
    var kind = d.data.kind
    if (kind == SUPER_GENRE){ offsetY = 4; } 
    else { offsetY = 16; }
    return offsetY;
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
