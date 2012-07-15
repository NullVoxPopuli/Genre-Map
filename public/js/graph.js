var FADE_OUT_SPEED = 200;
var TRANSITION_DURATION = 500;
var COOKIE_EXPIRATION = 1825;
var CANVAS_HEIGHT = 3000;
var CANVAS_WIDTH = 3000;
var SUB_GENRE_NODE_HEIGHT = 20;
var SUPER_GENRE_NODE_HEIGHT = 36;
var NODE_WIDTH_MULTIPLIER = 8;
var SUPER_GENRE_TEXT = "super_genre"
var SUB_GENRE_TEXT = "sub_genre"
var NON_ELECTRONIC_TEXT = "non_electronic"
var WINDOW_PADDING = 100;
var SHOW_YEAR_LINES = false;

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
// list of years for each super genre
var yearsByGenre = {};
// current nodes
var nodes = [];
 // current connections 
var links = [];
// list of names of the super genres that have their subgenres hidden
var hiddenSuperGenres = [];
// to help keep track of the currently visible super geners
var visibleSuperGenres = [];
// text from the search field
var searchText = "";

/*
	SVG VARIABLES
*/
var clusterHullOffset = 25;
// <g> containers
var hullG, linkg, nodeG, nodeLabelG, hullLabelG, yearLineG, yearLineLabelG;
// instance vars for .update()
var hull, link, node, nodeLabel, hullLabel, yearLine, yearLineLabel;
// current state of the network 
var net;
// different gravity wells for each year
var gravityWells = {};
var gravityLines = [];
// filtered version yearsByGenre, to be used with currentMinimumYear and gravityWells
var currentVisibleYears = []
// to be subtracted from all the years, so we have a resonable range to work with
var currentMinimumYear, currentMaximumYear;


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

function isSuperGenre(d){
	return (typeof(d.kind) != "undefined" &&
	        d.kind != null) && d.kind == "super_genre"
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
				y: yVals.max()
			}
		});
	}

	return hullset;
}

function drawCluster(d) {
	return curve(d.path); // 0.8
}

function updateGravity(){
	var numYears = currentMaximumYear - currentMinimumYear;
	// year separation should be a function of the number of years, and the 
	// width of the screen, using as much as possible
	var maxWidth = $(window).width() - (WINDOW_PADDING * 3);
	var yearSize = maxWidth / numYears;
	for (var i = 0; i < numYears + 1; i++){
		gravityWells[i + currentMinimumYear] = {
			x: i * yearSize + WINDOW_PADDING * 2 + $(".svg_container").scrollLeft(),
			y: i * yearSize + $(".svg_container").scrollTop()
		}
		gravityLines.push({
			x:gravityWells[i + currentMinimumYear].x,
			year: i + currentMinimumYear
		})
	}
}

// constructs the network to visualize
function network(data, prev, index) {
	var nodes = [], // output nodes
		links = []; // output links
	
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
		currentMinimumYear = net.nodes.minOfObjectForField("year");
		currentMaximumYear = net.nodes.maxOfObjectForField("year"); + 1;
		updateGravity();
		
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
		linkg.selectAll("line.link").remove();
		link = linkg.selectAll("line.link").data(net.links, linkid)
			.enter().append("line")
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
			.attr("x", function(d) {return -4 * d.name.length;})
			.attr("y", -14)
			.attr("rx", nodeBorderRadius)
			.attr("class", nodeClass)
			.attr("width", nodeWidth)
			.attr("height", nodeHeight);


		/* 
			LABELS FOR NODES
		*/ 
		nodeLabelG.selectAll("text.node").remove();
		nodeLabel = nodeLabelG.selectAll("text.node")
			.data(net.nodes)
			.enter().append("svg:text")
			.attr("text-anchor", "middle")
			.attr("class", nodeLabelClass)
			.text(function(d){return d.name});


		/*
			YEAR LINES
		*/
		if (SHOW_YEAR_LINES){
			yearLineG.selectAll("line").remove();
			yearLine = yearLineG.selectAll("line")
				.data(gravityLines)
				.enter().append("svg:line")
				.attr("x1", yearLineX)
				.attr("x2", yearLineX)
				.attr("y1", 0)
				.attr("y2", CANVAS_HEIGHT);

			yearLineLabelG.selectAll("text").remove();
			yearLineLabel = yearLineLabelG.selectAll("text")
				.data(gravityLines)
				.enter().append("svg:text")
				.attr("text-anchor", "middle")
				.text(function(d){return d.year});
		}


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
		// .linkStrength(0)
		.charge(function(d){
			if (hasGroup(d)){
				return -900;
			} else if (isSuperGenre(d)){
				return -600;
			} else {
				return -400;
			}

		})
		.friction(0.9)
		.gravity(0)
		.on("tick", tick);

	var svg = d3.select(".svg_container").append("svg");

	yearLineG = svg.append("g");
	hullG = svg.append("g");
	linkg = svg.append("g");
	nodeG = svg.append("g");
	nodeLabelG = svg.append("g");
	hullLabelG = svg.append("g");
	yearLineLabelG = svg.append("g");

	resizeSVG(); // fit to window
	updateGraph(); // draw
	svg_container.scrollLeft($("svg").width() / 2 - svg_container.width() / 2);
	svg_container.scrollTop($("svg").height() / 2 - svg_container.height() / 2);

	function nodeClass(d){
		return "node " + 
			d.kind + " " + 
			d.data.name.replace(" ", "").toUpperCase() + " " + 
			d.super_genre + 
			(isSuperGenre(d) && visibleSuperGenres.indexOf(d.name) != -1 ? "active" : "");
	}

	function nodeLabelClass(d){
		return "node " + (isSuperGenre(d) ? "super_genre" : "");
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
			console.log("Expand / Collapse - ing: " + genre_name.toUpperCase());
			// check if collapsed 
			var indexOfGenre;
			var genreNode = $(".super_genre." + genre_name)
			if ((indexOfGenre = hiddenSuperGenres.indexOf(genre_name)) != -1){
				hiddenSuperGenres.remove(indexOfGenre);
				visibleSuperGenres.push(genre_name);
				genreNode.addClass("active");
			} else {
				hiddenSuperGenres.push(genre_name)
				visibleSuperGenres.remove(visibleSuperGenres.indexOf(genre_name));
				genreNode.removeClass("active");
			}

			updateGraph();
		}
	}

	function tick(event) {
		var k = event.alpha * 0.1;
		var container = svg_container;
		var topCornerX = container.scrollLeft();
		var topCornerY = container.scrollTop();
		var hullData;
		var targetX, targetY;


		// update hull data + visuals
		if (!hull.empty()) {
			hullData = convexHulls(net.nodes, clusterHullOffset);
			hull.data(hullData)
				.attr("d", drawCluster);
			hullLabel
				.data(hullData)
				.attr("x", function(d) { 
					var bBox = getBBoxOfPointArray(d.path);
					var x = (bBox.bottomRightX + bBox.topLeftX) / 2;
					return x })
				.attr("y", function(d) {
					var bBox = getBBoxOfPointArray(d.path)
					var y = bBox.bottomRightY;
					return d.location.y + 25});
		}

		// apply collision and edge constraints on the nodes
		forceDiagram.nodes().forEach(function(node){

			if (isSuperGenre(node)){
				/*
					SUPER GENRES MUST STAY ON LEFT SIDE
				*/
				var newX = (topCornerX + WINDOW_PADDING);
				var newY = ((topCornerY + h / 2) - node.y) * k;

				 // Math.max(r, Math.min(w - r, d.x)); }) <- how to bound to box
				// make sure to bound the nodes to the inside of the canvas, so they don't escape our sight
				node.x = newX;
				node.y += newY;
				if (node.y < topCornerY + WINDOW_PADDING) node.y += nodeHeight(node);
				if (node.y > topCornerY + $(window).height() - WINDOW_PADDING) node.y -= nodeHeight(node);
			} else if (gravityWells.hasOwnProperty(node.year)){
				/*
					YEAR CONSTRAINTS / FOCI
				*/
				targetX = gravityWells[node.year].x;
				targetY = topCornerY + (h / 2);
				// targetY = gravityWells[node.year].y;
				node.x += (targetX - node.x);
				node.y += (targetY - node.y) * k;
			} else {
				// since there is no gravity, lets just push the ones that don't have
				// a year to the center of the viewing area
				targetX = topCornerX + (w / 2)
				targetY = topCornerY + (h / 2);
				// targetY = gravityWells[node.year].y;
				node.x += (targetX - node.x) * k;
				node.y += (targetY - node.y) * k;
			}

			/*
				PUSH NODE TOWARDS CENTER OF HULL / CATEGORY BLOB
			*/
			if (hasGroup(node) && hullData != undefined){
				var hullForNodeIndex = hullData.indexOfObjectForField("group", node.category);
				var hullForNode = hullData[hullForNodeIndex];
				var bBox = getBBoxOfPointArray(hullForNode.path);
				targetX = (bBox.topLeftX + bBox.bottomRightX) / 2;
				targetY = (bBox.topLeftY + bBox.bottomRightY) / 2;
				node.x += (targetX - node.y) * k;
				// node.y += (targetY - node.y) * k;
			}
		});


		// update nodes, links, and node labels
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
		
		nodeLabel.attr("x", function(d) { return d.x })
				 .attr("y", function(d) { return d.y });

		if (SHOW_YEAR_LINES){
		yearLine
			.attr("x1", function(d){return d.x})
				.attr("x2", function(d){ return d.x})
				.attr("class", function(d){
					return d.year
				});

			yearLineLabel.attr("x", function(d) { return d.x })
				.attr("y", function(d){
					return $(".svg_container").scrollTop() + $(window).height() - 15;
				});
		}

	};

	function averagePoint(arr){
		var x = 0;
		var y = 0;
		for(var i = 0; i < arr.length; i++){
			x += arr[i][0];
			y += arr[i][1];
		}
		return {
			x: x / arr.length,
			y: y / arr.length
		}
	}

	function getBBoxOfPointArray(arr){
		var topLeftX = CANVAS_WIDTH,
			topLeftY = CANVAS_HEIGHT, // min
			bottomRightX = 0,
			bottomRightY = 0; // max

		for(var i = 0; i < arr.length; i++){
			if (arr[i][1] > bottomRightY) bottomRightY = arr[i][1];
			if (arr[i][0] > bottomRightX) bottomRightX = arr[i][0];
			if (arr[i][1] < topLeftY) topLeftY = arr[i][1];
			if (arr[i][0] < topLeftX) topLeftX = arr[i][0];

		}
		return {
			topLeftX: topLeftX,
			topLeftY: topLeftY,
			bottomRightX: bottomRightX,
			bottomRightY: bottomRightY
		}
	}

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

	function nodeBorderRadius(d){
		return 10;//isSuperGenre(d) ? 1 : 2;
	}

	function nodeWidth(d) {
		return d.name.length * NODE_WIDTH_MULTIPLIER
	}

	function nodeHeight(d) {
		return SUB_GENRE_NODE_HEIGHT;
	}

	function yearLineX(d){
		return d.x;
	}

})
