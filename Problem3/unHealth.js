

/* * * * * * * * * 
 * Set up all the container information
 * * * * * * * * */
var bbDetail, bbOverview, dataSet, svg;

// set up margins
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 100
};

// width and height of the visualization
var width = 960 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;

// container for the overview chart
bbOverview = {
    x: 50,
    y: 100,
    w: width,
    h: 100 + 100
};

// container for the detail chart
bbDetail = {
    x: 0,
    y: bbOverview.y + bbOverview.h,
    w: width,
    h: 500
};

// Set up area for the overview graph
svg = d3.select("#visUN").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
});

// Set up the area for the detailed graph, also make sure its clipped
svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);


d3.csv("ewec.csv", function (data) {

    // parse the dates and convert data formats
    var parseDate = d3.time.format("%Y%m%d").parse;
    data.forEach(function (d, i) {
        d.date = parseDate(d.date);
        d.health = convertToInt(d.health);
    });

    // calculate min and max years for the scales and axis
    var min_year = d3.min(data, function (d) { return d.date; });
    var max_year = d3.max(data, function (d) { return d.date; });

    // store the overview axis/scales and the detail axis/scales
    var xAxis, xScale, yAxis, yScale;
    var xDetailAxis, xDetailScale, yDetailAxis, yDetailScale;

    // define the scale and axis for x
    xScale = d3.time.scale().domain(d3.extent(data, function(d) { return d.date;})).range([0, bbOverview.w]);
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);

    xDetailedScale = d3.time.scale().domain(d3.extent(data, function (d) { return d.date; })).range([0, bbOverview.w]);
    xDetailedAxis = d3.svg.axis().scale(xDetailedScale).orient("bottom").ticks(10);
    
    // get the max of each category
    var min_value = 0;
    var max_value = d3.max(data, function (d) { return d.health; });

    // define the scale and axis for y
    yScale = d3.scale.linear().domain([max_value, min_value]).range([bbOverview.y, bbOverview.h]);
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(3);

    yDetailedScale = d3.scale.linear().domain([max_value, min_value]).range([bbDetail.y, bbDetail.h]);
    yDetailedAxis = d3.svg.axis().scale(yDetailedScale).orient("left").ticks(3);

    // color function, not necessary for not but in case we increase color
    var color = d3.scale.category10();

    // calculate the line for the overview line
    var valueline = d3.svg.line()
                    .x(function (d) {
                        return xScale(d.date);
                    })
                    .y(function (d) {
                        return yScale(d.health);
                    });

    // calculate the area and the line for the detail graph
    var detailarea = d3.svg.area()
                    .x(function (d) {
                        return xDetailedScale(d.date);
                    })
                    .y0(bbDetail.h)
                    .y1(function (d) {
                        return yDetailedScale(d.health);
                    });

    var overviewpath = svg.append("path")
        .datum(data)
        .attr("class", "overviewPath")
        .style("stroke", color(0))
        .attr("d", valueline);

    var overviewdots = svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 1.5)
        .attr("cx", function (d) { return xScale(d.date); })
        .attr("cy", function (d) { return yScale(d.health); })
        .attr("stroke", color(0))
        .attr("fill", color(0));

    var detailedpath = svg.append("path")
        .datum(data)
        .attr("class", "detailArea")
        .style("stroke", color(0))
        .style("fill", color(0))
        .attr("d", detailarea);

    var detaileddots = svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 1.5)
        .attr("cx", function (d) { return xDetailedScale(d.date); })
        .attr("cy", function (d) { return yDetailedScale(d.health); })
        .attr("stroke", color(0))
        .attr("fill", color(0));


    // Add the X Axis for Overview
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + bbOverview.h + ")")
        .call(xAxis);

    // Add the Y Axis for the Overview
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yDetailedAxis);

    // Add the X Axis for Detailed
    svg.append("g")
        .attr("class", "x detailed axis")
        .attr("transform", "translate(0," + bbDetail.h + ")")
        .call(xDetailedAxis);


    // function when brushed is selected
    var brushed = function (d, i) {
        xDetailedScale.domain(brush.empty() ? xScale.domain() : brush.extent());
        detaileddots.attr("cx", function (d) { return xDetailedScale(d.date); })
            .attr("cy", function (d) { return yDetailedScale(d.health); });
        svg.select(".detailArea").attr("d", detailarea);
        svg.select(".x.detailed.axis").call(xDetailedAxis);
    };

    brush = d3.svg.brush().x(xScale).on("brush", brushed);

    svg.append("g").attr("class", "brush").call(brush)
      .selectAll("rect").attr({
          height: bbOverview.h - bbOverview.y,
          transform: "translate(0," + bbOverview.y + ")"
      });

    svg.append("text")
        .attr("class", "event")
        .attr("x", 0)
        .attr("y", 20)
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px")
        .attr("fill", "teal")
        .text("July 2012: Major Health Problems Linked to Poverty - http://www.nytimes.com/2011/07/10/us/10tthealth.html")
        .on("click", function (d, i) {
            console.log("clicked");
            d3.selectAll("rect.extent")
                .attr({
                    x: bbOverview.x,
                    y: 0,
                    width: 100,
                    height: bbOverview.h - bbOverview.y,
                    transform: "translate(0," + bbOverview.y + ")"
                });
            console.log(d3.selectAll("rect.w"));
        });

});

var convertToInt = function(s) {
    return parseInt(s.replace(/,/g, ""), 10);
};

