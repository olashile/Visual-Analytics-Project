var margin = {top: 20, right: 20, bottom: 30, left: 40},
	padding = {top: 20, right: 20, bottom: 20, left: 20},
	outerWidth = 1300,
    outerHeight = 600,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom;

var x0Scale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

var x1Scale = d3.scaleBand()
    .padding(0.05);

var yScale = d3.scaleLinear()
    .rangeRound([height, 0]);

var zScale = d3.scaleOrdinal()
    .range(["#3957ff", "#c203c8", "#10b0ff", "#bbd9fd", "#739400", "#ccf6e9", "#d5097e",  "#b1376e", "#5f99fd", "#d77070"]);


// Creates SVG
var svg = d3.select("body").append("svg")
			.attr("width", outerWidth)
			.attr("height", outerHeight)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var g = svg.append("g")
			.attr("transform", "translate(" + padding.left + "," + padding.top + ")");

// Load .csv file
d3.csv("data.csv", function(d, i, columns) {
	for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];		// need to understand
	return d;
}, function(error, data) {
	if (error) throw error;

	var keys = data.columns.slice(1)

	  data.sort(function(a,b){ return b.total - a.total ;}) ;

	// Set domains based on data
	x0Scale.domain(data.map(function(d) { return d.lead; }));
	x1Scale.domain(keys).rangeRound([0, x0Scale.bandwidth()]);
	yScale.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();	// WOOT?


	// ENTER
	//
	g.append("g")
		.selectAll("g")
		.data(data)
		.enter().append("g")
			.attr("transform", function(d) { return "translate(" + x0Scale(d.lead) + ",0)"; })
		// rects
		.selectAll("rect")
		.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
		.enter().append("rect")
			.attr("class", function(d) { return d.key; })
			.attr("x", function(d) { return x1Scale(d.key); })
			.attr("y", function(d) { return yScale(d.value); })
			.attr("width", x1Scale.bandwidth())
			.attr("height", function(d) { return height - yScale(d.value); })
			.attr("fill", function(d) { return zScale(d.key); });


	// Axes
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x0Scale));

	g.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale).ticks(null, "s"))
	.append("text")
		.attr("x", 2)
		.attr("y", yScale(yScale.ticks().pop()) + 0.5)
		.attr("dy", "0.32em")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("text-anchor", "start")
		.text("Qtde");

	// Legend
	var legend = g.append("g")
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("text-anchor", "end")
		.selectAll("g")
			.data(keys)
			.enter().append("g")
				.attr("class", "lgd")
				.attr("transform", function(d, i) { return "translate(-1000," + i * 20 + ")"; });

	legend.append("rect")
		.attr("class", function(d, i) { return "lgd_" + data.columns.slice(1)[i]; })
		.attr("x", width - 19)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", zScale);

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text(function(d) { return d; });

	// BARS SELECTION
	d3.selectAll("rect")
		.on("mousemove", function(d) {
			d3.selectAll("." + d.key).style("fill", "#0da4d3")
			d3.selectAll(".lgd_" + d.key).style("fill", "#0da4d3")
		})
		.on("mouseout", function(d) {
			d3.selectAll("." + d.key).style("fill", function(d) { return zScale(d.key); });
			d3.selectAll(".lgd_" + d.key).style("fill", function(d, i) { return zScale[i]; });
		});
	// LEGEND SELECTION
	svg.selectAll("g.lgd")
		.on("mousemove", function(d) {
			d3.selectAll("." + d).style("fill", "#0da4d3")
			d3.selectAll(".lgd_" + d).style("fill", "#0da4d3")
		})
		.on("mouseout", function(d) {
			d3.selectAll("." + d).style("fill", function(d, i) { return zScale[i]; })
			d3.selectAll(".lgd_" + d).style("fill", function(d, i) { return zScale[i]; });
		})
})
