var FADE_OUT_SPEED = 200;
var TRANSITION_DURATION = 500;
var COOKIE_EXPIRATION = 1825;
var CANVAS_HEIGHT = $(window).height();//3000;
var CANVAS_WIDTH = $(window).width();//3000;
var NODE_WIDTH_MULTIPLIER = 8;
var WINDOW_PADDING = 100;

// force diagram object
var forceDiagram; 
// text from the search field
var searchText = "";
/*
	SVG VARIABLES
*/
// <g> containers
var linkg, nodeG, nodeLabelG, yearLineG, yearLineLabelG, markerG;
// instance vars for .update()
var link, node, nodeLabel, yearLine, yearLineLabel, marker;
// current state of the network 
var net;

var w = $(window).width(),
    h = $(window).height(),
    node,
    link,
    label,
    root;

var force = d3.layout.force()
    .on("tick", tick)
    .charge(function(d) { return (-100 - d.children.length * 100) ; })
    .linkDistance(function(d) { return d.target._children ? 100 : 170; })
    .friction(0.95)
    .size([w, h - 160]);

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

console.log(tree);
update();

function update() {
  console.log("updating...")
  var nodes = flatten(tree),
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

label = vis.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
label.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.name; });

label.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

    // text.exit().remove();

  // Update the nodes…
  node = vis.selectAll("circle.node")
      .data(nodes, function(d) { return d.id; })
      .style("fill", color);

  node.transition()
      .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; });

  // Enter any new nodes.
  node.enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; })
      .style("fill", color)
      .on("click", click)
      .call(force.drag);

  // Exit any old nodes.
  node.exit().remove();
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  
  label.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

// Toggle children on click.
function click(d) {
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
    if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return 10;
  }

  root.size = recurse(root);
  return nodes;
}
