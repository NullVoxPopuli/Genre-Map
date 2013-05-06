var FADE_OUT_SPEED = 200;
var TRANSITION_DURATION = 500;
var CANVAS_HEIGHT = $(window).height();
var CANVAS_WIDTH = $(window).width();
var NODE_WIDTH_MULTIPLIER = 8;
var WINDOW_PADDING = 100;


var NODE_HEIGHT = 20;
var NODE_RADIUS = 26;

// force diagram object
var forceDiagram; 
// text from the search field
var searchText = "";
/*
	SVG VARIABLES
*/
// <g> containers
var linkg, nodeG, nodeLabelG, markerG;
// instance vars for .update()
var link, node, nodeLabel, marker;
// current state of the network 
var net;

var w = CANVAS_WIDTH,
    h = CANVAS_HEIGHT,
    node,
    link,
    label,
    root,
    nodes,
    links;

var force = d3.layout.force()
    .on("tick", tick)
    .charge(-1850)
    .linkDistance(120)
    .friction(0.8)
    .gravity(0.2)
    .size([w, h]);

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);


$(function(){
  $(window).resize(function(){
    w = $(window).width();
    h = $(window).height();
    $("svg").attr("width", w).attr("height", h);

  });
});


update();

function update() {
  nodes = flatten(tree),
  links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
    .nodes(nodes)
    .links(links)
    .start();

  // Update the links…
  link = vis.selectAll("line.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links.
  link.enter().insert("svg:line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Exit any old links.
  link.exit().remove();

  // Update the nodes…
  node = vis.selectAll("circle.node")
      .data(nodes, function(d) { return d.id; })
      .style("fill", color);

  // Enter any new nodes.
  node.enter().append("svg:circle")
      .attr("class", "node")
      .attr("name", function(d) {return d.name})
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return NODE_RADIUS + 2*Math.sqrt(numChildren(d)); })
      .style("fill", color)
      .on("click", click)
      .call(force.drag);

  // Exit any old nodes.
  node.exit().remove();

  label = vis.selectAll("text.label")
    .data(nodes, function(d) {return d.name;});

  label.enter().append("text")
    .attr("class", "label")
    .attr("x", 0)
    .attr("y", ".31em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.name; });

  label.exit().remove();

}

function tick() {
var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

  while (++i < n) {
    q.visit(collide(nodes[i]));
  }



  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  // node.attr("transform", function(d) {
  //     return "translate(" + d.x + "," + d.y + ")";
  //   });

  label.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

// Color leaf nodes orange
function color(d) {
  return d.children ? "#506D80" : d._children ? "#1BA1E2" : "#B3C732";
}

// Toggle children on click.
function click(d) {
  showGenreDetails(d);
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update();
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}

function nodeWidth(d){
  return d.name.length * NODE_WIDTH_MULTIPLIER + 20;
}

function nodeHegiht(d){
  return NODE_HEIGHT;
}

function nodeBorderRadius(d){
  return 10;
}

function collide(node) {
  var r = node.r,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;

  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      } 
    }
    return x1 > nx2
        || x2 < nx1
        || y1 > ny2
        || y2 < ny1;
  };
}

function numChildren(d){
  return d.children ? d.children.length : d._children ? d._children.length : 0;
}
