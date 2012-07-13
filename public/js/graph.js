var FADE_OUT_SPEED = 200;
var VIDEO_PLAYER_WIDTH = 853;
var VIDEO_PLAYER_HEIGHT = 480;
var TRANSITION_DURATION = 500;
var COOKIE_EXPIRATION = 1825;
var CANVAS_HEIGHT = 3000;
var CANVAS_WIDTH = 3000;
var SUB_GENRE_NODE_HEIGHT = 20;
var NODE_WIDTH_MULTIPLIER = 8;
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
var clusterHullOffset = 25;
// <g> containers
var hullG, linkg, nodeG, nodeLabelG, hullLabelG;
// instance vars for .update()
var hull, link, node, nodeLabel, hullLabel;
// current state of the network 
var net;

var curve = d3.svg.line()
	.interpolate("caridnal-closed")
	.tension(0.85);

var fill = d3.scale.category10();


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
			 var widthOffset = n.name.length * NODE_WIDTH_MULTIPLIER / 2;
			 var heightOffset = SUB_GENRE_NODE_HEIGHT / 2;
			 var i = getCategory(n);
			 var l = hulls[i] || (hulls[i] = []);
				l.push([n.x - widthOffset, n.y - heightOffset]);
				l.push([n.x - widthOffset, n.y + heightOffset]);
				l.push([n.x + widthOffset, n.y - heightOffset]);
				l.push([n.x + widthOffset, n.y + heightOffset]);
		}
	}

	// create convex hulls
	var hullset = [];

	for (i in hulls) {
		var current_hull = hulls[i]
		var hull_path = d3.geom.hull(current_hull);
		var xVals = [];
		var yVals = [];
		for (var j = 0; j < hull_path.length; j++){
			xVals.push(hull_path[j][0]);
			yVals.push(hull_path[j][1]);
		}

		hullset.push({
			group: i,
			path: hull_path,
			location: {
				x: xVals.avg(),
				y: yVals.min()
			}
		});
	}

	return hullset;
}

function drawCluster(d) {
	return curve(d.path); // 0.8
}


// constructs the network to visualize
function network(data, prev, index) {
	var nodes = [], // output nodes
		links = []; // output links

	
	// keep old nodes

	// loop over genre_nodes, adding nodes as needed
	searchText = searchText.toUpperCase();
	for (var i = 0; i < data.nodes.length; i++){
		currentNode = data.nodes[i];
		nodeName = currentNode.data.name.toUpperCase();
		categoryName = currentNode.category.toUpperCase();
		parentName = currentNode.super_genre;
		nodeIndex = nodes.indexOfObjectForField("id", currentNode.id);


		// by default, we want to include whatever the searchText tells up to
		// and to exclude anything in "hiddenSuperGenres"
		var shouldSearch = (searchText.length > 0);
		var shouldNotSearch = (!shouldSearch);
		var nodeExists = (nodeIndex == -1);
		var partOfCollapsedSuperGenre = (hiddenSuperGenres.indexOf(parentName) == -1 || parentName == "");

		if ((shouldSearch && (nodeName.indexOf(searchText) != -1 || categoryName.indexOf(searchText) != -1)) || 
			( shouldNotSearch && partOfCollapsedSuperGenre && nodeExists)){

			// add the node
			nodes.push(currentNode);

			// update category size
			if (hasGroup(currentNode)){
				var category_index = categories.indexOfObjectForField("name", currentNode.category)
				categories[category_index].size = (categories[category_index].size == undefined ? 0 : categories[category_index].size + 1);
			}
		}
			// l.size += 1;
		currentNode.group_data = {size:5};
	}


		// compute the links array
	//	- must lookup the new positions
	//	- loop over each connection, and see if both source and target are visible
	for (var i = 0; i < data.links.length; i++){

		currentConnection = connections[i];
		sourceID = currentConnection.source;
		targetID = currentConnection.target;
		sourceIndex = nodes.indexOfObjectForField("id", sourceID);
		targetIndex = nodes.indexOfObjectForField("id", targetID);

		// both most exist in nodes
		if (sourceIndex != -1 && targetIndex != -1){
			links.push({"source":sourceIndex, "target":targetIndex, "size":0});
		}
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


	updateGraph = function(){
		var hullData;
		if (forceDiagram) forceDiagram.stop();

		net = network(data, net, getCategory);

		/*
			REINITIALIZE THE GRAPH
		*/
		forceDiagram
			.nodes(net.nodes)
			.links(net.links)
			.linkDistance(function(n, i){
			// larger distance for bigger groups:
			// both between single nodes and _other_ groups (where size of own node group still counts),
			// and between two group nodes.
			// 

			var sourceCategory = hasGroup(n.source) ? n.source.category : false;
			var targetCategory = hasGroup(n.target) ? n.target.category : false;

			var differentCategories = sourceCategory != targetCategory;
			var sourceCategorySize = sourceCategory ? categories[categories.indexOfObjectForField("name", sourceCategory)].size : 0;
			var targetCategorySize = targetCategory ? categories[categories.indexOfObjectForField("name", targetCategory)].size : 0;


			return 40 + (sourceCategory && targetCategory ? (differentCategories ? 160 : 0) : 50);
			})
			.start();

		/*
			HULLS / CATEGORY BACKGROUND GROUPING BLOB
		*/
		hullData = convexHulls(net.nodes, clusterHullOffset); 
	 	hullG.selectAll("path.hull").remove();
		hull = hullG.selectAll("path.hull")
			.data(hullData)
			.enter().append("path")
			.attr("class", function(d) { return "hull " + d.group})
			.attr("d", drawCluster)
			.style("fill", function(d) { return fill(d.group); });


		/*
			LABELS FOR HULLS / CATEGORIES
		*/

		hullLabelG.selectAll("text.hull").remove();
		hullLabel = hullLabelG.selectAll("text.hull")
			.data(hullData)
			.enter().append("svg:text")
			.attr("text-anchor", "middle")
			.attr("class", function(d) { return "hull " + d.group})
			.text(function(d) { return d.group});


		/*
			CONNECTIONS / LINKS BETWEEN NODES
		*/
		link = linkg.selectAll("line.link").data(net.links, linkid);
		link.exit().remove();
		link.enter().append("line")
			.attr("class", "link")
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			.style("stroke-width", function(d) { return d.size || 1; });


		/*
			NODES
		*/
		nodeG.selectAll("rect").remove();

		node = nodeG.selectAll("rect")
			.data(net.nodes)
			.enter().append("svg:rect")
			.attr("class", nodeClass)
			.call(forceDiagram.drag)
			.on("click", click)
			// .attr("r", radius);
			.attr("x", function(d) {return -4 * d.name.length;})
			.attr("y", -14)
			.attr("rx", 10)
			.attr("class", nodeClass)
			.attr("width", function(d) {return d.name.length * NODE_WIDTH_MULTIPLIER})
			.attr("height", function(d) {return SUB_GENRE_NODE_HEIGHT;});

		// remove the nodes


		/* 
			LABELS FOR NODES
		*/ 
		nodeLabelG.selectAll("text.node").remove();
		nodeLabel = nodeLabelG.selectAll("text.node")
			.data(net.nodes)
			.enter().append("svg:text")
			.attr("text-anchor", "middle")
			.attr("class", "node")
			.text(function(d){return d.name});


		/*
			TELL D3 WHICH FUNCTION TO USE UPON UPDATE
		*/
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
		.charge(function(d){
			if (hasGroup(d)){
				return -900;
			} else {
				return -400;
			}

		})
		.friction(0.9)
		.gravity(0.1)
		.on("tick", tick);

	var svg = d3.select(".svg_container").append("svg");

	hullG = svg.append("g");
	linkg = svg.append("g");
	nodeG = svg.append("g");
	nodeLabelG = svg.append("g");
	hullLabelG = svg.append("g");

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
		// while (++i < n) {
  //   		q.visit(collide(nodes[i]));
  // 		}

		if (!hull.empty()) {
			var hullData = convexHulls(net.nodes, clusterHullOffset);
			hull.data(hullData)
				.attr("d", drawCluster);
			hullLabel
				.data(hull)
				.attr("x", function(d) { console.log(svgCenter(d[0]));return svgCenter(d[0]).x })
				.attr("y", function(d) { return svgCenter(d[0]).y });

		}

		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
			
		node.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		nodeLabel.attr("x", function(d) { return d.x })
				 .attr("y", function(d) { return d.y });
	};


	function svgCenter(p){
		if (!p){
			return 0;
		}
		// p is a path / shape
		var bbox = p.getBBox(); 
		var x = Math.floor(bbox.x + bbox.width/2.0); 
		var y = Math.floor(bbox.y + bbox.height);
		return {
			x: x,
			y: y
		}
	}

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
