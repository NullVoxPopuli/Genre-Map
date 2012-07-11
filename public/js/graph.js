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
var forceDiagram; 
// master list of connections
// the source and target fields for each entry corresponds to a node's database id
var connections = []; 
// master list of nodes
// - the name field for each entry here is the database id
var genre_nodes = []; 
// combination of connections and genre_nodes
var data = {};
// list of available categories to group nodes with
var categories = [];
// current nodes
var nodes = [];
 // current connections 
var links = [];
// list of names of the super genres that have their subgenres hidden
var hiddenSuperGenres = [] 
// text from the search field
var searchText = "" 

/*
  SVG VARIABLES
*/
var clusterHullOffset = 15;
// <g> containers
var hullg, linkg, nodeg, textg;
// instance vars for .update()
var hull, link, node, text;
// current state of the network 
var net;

var curve = d3.svg.line()
  .interpolate("caridnal-closed")
  .tension(0.85);

var fill = d3.scale.category20();


function nodeid(n) {
  return n.size ? "_g_"+n.group : n.name;
}

function linkid(l) {
  var u = nodeid(l.source),
      v = nodeid(l.target);
  return u<v ? u+"|"+v : v+"|"+u;
}

function hasGroup(d){
  return (typeof(d.category) != "undefined" && 
    d.category != null) && d.category != "";
}

function getCategory(n) { return n.category; }

function convexHulls(nodes, offset) {
  var hulls = {};

  // create point sets
  for (var k=0; k<nodes.length; ++k) {
    var n = nodes[k];
      if (hasGroup(n)){
       // if (n.size) continue;
        var i = getCategory(n),
            l = hulls[i] || (hulls[i] = []);
            l.push([n.x-offset, n.y-offset]);
            l.push([n.x-offset, n.y+offset]);
            l.push([n.x+offset, n.y-offset]);
            l.push([n.x+offset, n.y+offset]);
      }
  }

  // create convex hulls
  var hullset = [];
  for (i in hulls) {
    hullset.push({group: i, path: d3.geom.hull(hulls[i])});
  }

  return hullset;
}

function drawCluster(d) {
  return curve(d.path); // 0.8
}


// constructs the network to visualize
function network(data, prev, index) {
  var gm = {},    // group map
      nm = {},    // node map
      lm = {},    // link map
      gn = {},    // previous group nodes
      gc = {},    // previous group centroids
      nodes = [], // output nodes
      links = []; // output links
    

  // // process previous nodes for reuse or centroid calculation
  // if (prev) {
  //   prev.nodes.forEach(function(n) {
  //     var i = index(n), o;
  //     if (n.size > 0) {
  //       gn[i] = n;
  //       n.size = 0;
  //     } else {
  //       o = gc[i] || (gc[i] = {x:0,y:0,count:0});
  //       o.x += n.x;
  //       o.y += n.y;
  //       o.count += 1;
  //     }
  //   });
  // }



  // // determine nodes
  // for (var k=0; k<data.nodes.length; ++k) {
  //   var n = data.nodes[k],
  //       i = index(n),
  //       l = gm[i] || (gm[i]=gn[i]) || (gm[i]={group:i, size:0, nodes:[]});

  //   if (categories.indexOf(n.category) != -1) {
  //     // the node should be directly visible
  //     nm[n.name] = nodes.length;
  //     nodes.push(n);
  //     if (gn[i]) {
  //       // place new nodes at cluster location (plus jitter)
  //       n.x = gn[i].x + Math.random();
  //       n.y = gn[i].y + Math.random();
  //     }
  //   } else { // n / node is not part of a cluster
  //     // the node is part of a collapsed cluster
  //     //if (l.size == 0) {
  //       // if new cluster, add to set and position at centroid of leaf nodes
  //       nm[i] = nodes.length;
  //       nodes.push(n);
  //       //if (gc[i]) {
  //         //l.x = gc[i].x / gc[i].count;
  //         //l.y = gc[i].y / gc[i].count;
  //       //}
  //     //}
  //     //l.nodes.push(n);
  //   }
  //   // always count group size as we also use it to tweak the force graph strengths/distances
  //   l.size += 1;
  //   n.group_data = l;
  // }







  // if (prev){
  //   prevNodes = prev.nodes;
  //   for (var i = 0; i < prevNodes.length; i++){
  //     currentNode = prevNodes[i];
  //     nodeName = currentNode.data.name.toUpperCase();
  //     parentName = currentNode.super_genre;

  //     if ((searchText.length > 0 && nodeName.indexOf(searchText) != -1) || // check if search text is contained in node name
  //         ( searchText.length == 0 && (hiddenSuperGenres.indexOf(parentName) == -1 || parentName == "")  &&
  //                   nodes.indexOfObjectForField("id", currentNode.id) == -1)){ // make sure node isn't already in nodes[]
  //       nodes.push(currentNode);
  //     }

  //   }
  // }
    
    // keep old nodes

    // loop over genre_nodes, adding nodes as needed
    searchText = searchText.toUpperCase();
    for (var i = 0; i < data.nodes.length; i++){
      currentNode = data.nodes[i];
      nodeName = currentNode.data.name.toUpperCase();
      parentName = currentNode.super_genre;
      nodeIndex = nodes.indexOfObjectForField("id", currentNode.id);


      // by default, we want to include whatever the searchText tells up to
      // and to exclude anything in "hiddenSuperGenres"
      if ((searchText.length > 0 && nodeName.indexOf(searchText) != -1) || 
          ( searchText.length == 0 && (hiddenSuperGenres.indexOf(parentName) == -1 || parentName == "")  &&
                    nodeIndex == -1)){

        if (categories.indexOf(currentNode.category) != -1) {
          i = getCategory(currentNode);
        l = gm[i] || (gm[i]=gn[i]) || (gm[i]={group:i, size:0, nodes:[]});
          // the node should be directly visible
          nm[currentNode.name] = nodes.length;
          nodes.push(currentNode);
          if (gn[i]) {
            // place new nodes at cluster location (plus jitter)
            n.x = gn[i].x + Math.random();
            n.y = gn[i].y + Math.random();
          }
        }
         else{
            nodes.push(currentNode);

        }

      }
          // l.size += 1;
    currentNode.group_data = {size:5};
    }




  
  // for (i in gm) { gm[i].link_count = 0; }

  // determine links
 // for (k=0; k<data.links.length; ++k) {
 //   var e = data.links[k],
 //       u = index(e.source),
 //       v = index(e.target);
 //   if (u != v) {
 //     gm[u].link_count++;
 //     gm[v].link_count++;
 //   }
    //u = expand[u] ? nm[e.source.name] : nm[u];
    //v = expand[v] ? nm[e.target.name] : nm[v];
//      u = nm[u];
//      v = nm[v];
    //var i = (u<v ? u+"|"+v : v+"|"+u),
      //  l = lm[i] || (lm[i] = {source:u, target:v, size:0});
//      links.push({source:u, target:v, size:0});
    //l.size += 1;
//  }
  // for (i in data.links) { 
  //     var currentLink = data.links[i];
  //     if (currentLink != undefined && currentLink.source != undefined && currentLink.target != undefined){
  //         var sourceIndexInData = nodes.indexOfObjectForField("id", currentLink.source.name);
  //         var targetIndexInData = nodes.indexOfObjectForField("id", currentLink.target.name);
  //         if (sourceIndexInData != -1 && targetIndexInData != -1){
  //             links.push({source:sourceIndexInData, target:targetIndexInData, size: 0}); 
  //         }
  //     }
  // }
  //   console.log(data.nodes);
  //   console.log(links);

      // compute the links array
    //  - must lookup the new positions
    //  - loop over each connection, and see if both source and target are visible
    for (var i = 0; i < connections.length; i++){

      currentConnection = connections[i];
      sourceID = currentConnection.source;
      targetID = currentConnection.target;
      sourceIndex = nodes.indexOfObjectForField("id", sourceID);
      targetIndex = nodes.indexOfObjectForField("id", targetID);

      // both most exist in nodes
      if (sourceIndex != -1 && targetIndex != -1)
        links.push({"source":sourceIndex, "target":targetIndex, "size":0});
    }
  return {nodes: nodes, links: links};
}



$(function(){
  // cotainer that allows scrolling
  var svg_container = $(".svg_container");

  var toolbar = $(".toolbar"); 
  var sidebar = $(".information");
  var toolbar_height = toolbar.outerHeight();
  var sidebar_width = sidebar.outerWidth();

  getSizeForCanvas = function(){
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
    resizeSVG = function(){
    var size = getSizeForCanvas();
    $(".svg_container").animate({
      "top": size.y,
      "left": size.x,
      // "width": size.w,
      // "height": size.h
    });

  }



  // network = function(data, prevForceLayout, getCategory){
  //   var groupMap,
  //       nodeMap,
  //       linkMap,
  //       previousGroupNodes,
  //       previousGroupCentroids, 
  //       outputNodes = [],
  //       outputLinks = [];

  //   var currentNode, nodeName, parentName,
  //       currentConnection, sourceID, targetID, sourceIndex, targetIndex;;

  //   console.log("updating network...");
  //   /*
  //    Things we need to do:
  //     - Hide any nodes / links that are associated wit the hidden super genres
  //     - Of the nodes that are visible, filter any by name for searching
  //     - Generate The list of links based on the current list of nodes
  //     - set current connections to "links"
  //     - set current nodes to "nodes"
  //   */

  //   // always compare in upper case
  //   searchText = searchText.toUpperCase();

  //   // // process previous nodes for reuse or centroid calculation
  //   // if (prevForceLayout){
  //   //   prevForceLayout.nodes.forEach(function(node) {
  //   //     var i = index(node), o;
  //   //     if (node.size > 0){
  //   //       previousGroupNodes[i] = node;
  //   //       node.size = 0;
  //   //     }
  //   //   });
  //   // }

  //   // determine nodes
  //   for (var k = 0; k < data.nodes.length; ++k){
  //     var node = data.nodes[k];
  //     i = index(node);

  //   }







  //   // clear links
  //   links.clear();
  //   // nodes.clear();
  //   // previous nodes - be sure to reuse them! RECYCLE!
  //   prevNodes = nodes;
  //   nodes = [];
  //   for (var i = 0; i < prevNodes.length; i++){
  //     currentNode = prevNodes[i];
  //     nodeName = currentNode.data.name.toUpperCase();
  //     parentName = currentNode.super_genre;

  //     if ((searchText.length > 0 && nodeName.indexOf(searchText) != -1) || 
  //         ( searchText.length == 0 && (hiddenSuperGenres.indexOf(parentName) == -1 || parentName == "")  &&
  //                   nodes.indexOfObjectForField("id", currentNode.id) == -1)){
  //       nodes.push(currentNode);
  //     }

  //   }
    
  //   // keep old nodes

  //   // loop over genre_nodes, adding nodes as needed
  //   for (var i = 0; i < genre_nodes.length; i++){
  //     currentNode = genre_nodes[i];
  //     nodeName = currentNode.data.name.toUpperCase();
  //     parentName = currentNode.super_genre;

  //     // by default, we want to include whatever the searchText tells up to
  //     // and to exclude anything in "hiddenSuperGenres"
  //     if ((searchText.length > 0 && nodeName.indexOf(searchText) != -1) || 
  //         ( searchText.length == 0 && (hiddenSuperGenres.indexOf(parentName) == -1 || parentName == "")  &&
  //                   nodes.indexOfObjectForField("id", currentNode.id) == -1)){
  //       nodes.push(currentNode);
  //     }
  //   }
  //   // compute the links array
  //   //  - must lookup the new positions
  //   //  - loop over each connection, and see if both source and target are visible
  //   for (var i = 0; i < connections.length; i++){

  //     currentConnection = connections[i];
  //     sourceID = currentConnection.source;
  //     targetID = currentConnection.target;
  //     sourceIndex = nodes.indexOfObjectForField("id", sourceID);
  //     targetIndex = nodes.indexOfObjectForField("id", targetID);

  //     // both most exist in nodes
  //     if (sourceIndex != -1 && targetIndex != -1)
  //       links.push({"source":sourceIndex, "target":targetIndex});
  //   }
  // }

  // redraw everything


  updateGraph = function(){
    if (forceDiagram) forceDiagram.stop();

    net = network(data, net, getCategory);

    forceDiagram
      .nodes(net.nodes)
      .links(net.links)
      .linkDistance(function(l, i){
        var n1 = l.source, n2 = l.target;
        // larger distance for bigger groups:
        // both between single nodes and _other_ groups (where size of own node group still counts),
        // and between two group nodes.
        // 
        // reduce distance for groups with very few outer links,
        // again both in expanded and grouped form, i.e. between individual nodes of a group and
        // nodes of another group or other group node or between two group nodes.
        //
        // The latter was done to keep the single-link groups ('blue', rose, ...) close.
        return 100 + 
          Math.min(20 * Math.min((n1.size || (n1.group != n2.group ? n1.group_data.size : 0)), 
                                 (n2.size || (n1.group != n2.group ? n2.group_data.size : 0))), 
                   -100 + 
                   30 * Math.min((n1.link_count || (n1.group != n2.group ? n1.group_data.link_count : 0)),
                                 (n2.link_count || (n1.group != n2.group ? n2.group_data.link_count : 0))), 
                   100);
        //return 150;
      })
      .start();

 hullg.selectAll("path.hull").remove();
  hull = hullg.selectAll("path.hull")
      .data(convexHulls(net.nodes, clusterHullOffset))
    .enter().append("path")
      .attr("class", "hull")
      .attr("d", drawCluster)
      .style("fill", function(d) { return fill(d.group); });

  link = linkg.selectAll("line.link").data(net.links, linkid);
  link.exit().remove();
  link.enter().append("line")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("stroke-width", function(d) { return d.size || 1; });


    node = nodeg.selectAll(".node")
      .data(forceDiagram.nodes());

    // new nodes
    node.enter().append("svg:rect")
        .attr("class", nodeClass)
        .call(forceDiagram.drag)
        .on("click", click)
        // .attr("r", radius);
        .attr("x", function(d) {return -4 * d.name.length;})
        .attr("y", -14)
        .attr("rx", 10)
        .attr("class", nodeClass)
        .attr("width", function(d) {return d.name.length * 8})
        .attr("height", function(d) {return 20;});

    // remove the nodes
    node.exit().remove();



  text = textg.selectAll("text").data(net.nodes);
  text.exit().remove();
    text.enter().append("svg:text")
      .attr("text-anchor", "middle")
      .text(function(d){return d.name});


  forceDiagram.on("tick", tick);

  }

  initial_size = getSizeForCanvas()
  var w = initial_size.w,
      h = initial_size.h,
      x = initial_size.x,
      y = initial_size.y,
      node,
      link,
      text;

  forceDiagram = d3.layout.force()
      .size([CANVAS_WIDTH, CANVAS_HEIGHT])
      // .linkDistance(100)
      .charge(-1600)
      .friction(0.9)
      .gravity(0.1)
      .on("tick", tick);

  var svg = d3.select(".svg_container").append("svg");

  hullg = svg.append("g");
  linkg = svg.append("g");
  nodeg = svg.append("g");
  textg = svg.append("g");

  resizeSVG(); // fit to window
  updateGraph(); // draw
  svg_container.scrollLeft($("svg").width() / 2 - svg_container.width() / 2);
  svg_container.scrollTop($("svg").height() / 2 - svg_container.height() / 2);

  function nodeClass(d){
    return "node " + 
            d.kind + " " + 
            d.data.name.replace(" ", "").toUpperCase() + " " + 
            d.super_genre;
  }

  function radius(d) {
    var radius = 6;   
      if (d.kind == SUPER_GENRE_TEXT){ radius = 25; } 
      else { radius = 6; }
      return radius; 
  }

  function click(d) {
    if (d.kind != SUPER_GENRE_TEXT) {
      showGenreDetails(d);
    } else {
      var genre_name = d.data.name;
      console.log("Expand / Collapse - ing: " + genre_name);
        // check if collapsed 
      var indexOfGenre;
      if ((indexOfGenre = hiddenSuperGenres.indexOf(genre_name)) != -1){
        hiddenSuperGenres.remove(indexOfGenre);
      } else {
        hiddenSuperGenres.push(genre_name)
      }
      updateGraph();
    }
  }

  function tick() {

        if (!hull.empty()) {
      hull.data(convexHulls(net.nodes, clusterHullOffset))
          .attr("d", drawCluster);
    }

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // node.attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });
      
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

      text.attr("x", function(d) { return d.x })
          .attr("y", function(d) { return d.y });
    // link.attr("d", function(d) {
    //   var dx = d.target.x - d.source.x,
    //       dy = d.target.y - d.source.y,
    //       dr = Math.sqrt(dx * dx + dy * dy);
    //   return "M" + d.source.x + "," + d.source.y + "L"+ d.target.x + "," + d.target.y;
    // });


    // text.attr("transform", function(d) {
    //   return "translate(" + d.x + "," + d.y + ")";
    // });
  };

  function textOffsetY(d){
    var offsetY = 0;
    var kind = d.kind;
    if (kind == SUPER_GENRE){ offsetY = 4; } 
    else { offsetY = 16; }
    return offsetY;
  }

  function textOffsetX(d){
    var offsetX = 0;

    var kind = d.kind;
    if (kind == SUPER_GENRE){ offsetX = -4; } 
    else { offsetX = -16; }
    return offsetX;
  }


})
