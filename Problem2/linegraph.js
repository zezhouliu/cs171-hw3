/**
 * Created by hen on 2/20/14.
 */
    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 150
    };

    width = 960 - margin.left - margin.right;

    height = 300 - margin.bottom - margin.top;

    bbVis = {
        x: 0 + 100,
        y: 10,
        w: width - 100,
        h: 100
    };

    dataSet = [];

    svg = d3.select("#vis").append("svg").attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });


    d3.csv("timeline.csv", function(data) {

        // convert your csv data and add it to dataSet
        return createVis(data);
    });

    createVis = function (data) {

        var parseDate = d3.time.format("%d-%b-%y").parse;

        var min_year = d3.min(data, function (d) { return d.year; });
        var max_year = d3.max(data, function (d) { return d.year; });

        var xAxis, xScale, yAxis, yScale;

        // define the scale and axis for x
        xScale = d3.scale.linear().domain([min_year, max_year]).range([0, bbVis.w]);  
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

        var min_value = 0;
        
        // get the max of each category
        var max_census = d3.max(data, function (d) { return d.USCensus; });
        var max_populationbureau = d3.max(data, function (d) { return d.PopulationBureau; });
        var max_UN = d3.max(data, function (d) { return d.UN; });
        var max_HYDE = d3.max(data, function (d) { return d.HYDE; });
        var max_Maddison = d3.max(data, function (d) { return d.Maddison; });

        var max_value = Math.max(max_census, max_populationbureau, max_UN, max_HYDE, max_Maddison);

        // define the scale and axis for y
        yScale = d3.scale.linear().domain([max_value, min_value]).range([0, height]);
        yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(7);

        // filter out the values for each category
        var data_USCensus = data.filter(function (d, i) {
            return d.USCensus;
        });
        var data_populationBureau = data.filter(function (d, i) {
            return d.PopulationBureau;
        });
        var data_UN = data.filter(function (d, i) {
            return d.UN;
        });
        var data_HYDE = data.filter(function (d, i) {
            return d.HYDE;
        });
        var data_Maddison = data.filter(function (d, i) {
            return d.Maddison;
        });

        data_USCensus.forEach(function (d, i) {
            d.type = "census";
            d.value = d.USCensus;
        });
        data_populationBureau.forEach(function (d, i) {
            d.type = "populationbureau";
            d.value = d.PopulationBureau;
        });
        data_UN.forEach(function (d, i) {
            d.type = "un";
            d.value = d.UN;
        });
        data_HYDE.forEach(function (d, i) {
            d.type = "hyde";
            d.value = d.HYDE;
        });
        data_Maddison.forEach(function (d, i) {
            d.type = "maddison";
            d.value = d.Maddison;
        })
        
        var color = d3.scale.category10();
        var datasets = [];
        datasets.push(data_USCensus, data_populationBureau, data_UN, data_HYDE, data_Maddison)

        var valueline = d3.svg.line()
                        .interpolate("basis")
                        .x(function (d, i) {
                            return xScale(d.year);
                        })
                        .y(function (d, i) {
                            return yScale(d.value);
                        });

        svg.selectAll(".line")
            .data(datasets)
            .enter()
            .append("path")
            .attr("class", "line")
            .style("stroke", function (d, i) {
                return color(d[i].type);
            })
            .attr("d", valueline);

        var all_datapoints = d3.merge(datasets);
        svg.selectAll("dot")
        .data(all_datapoints)
        .enter().append("circle")
        .attr("r", 1.5)
        .attr("cx", function (d) { return xScale(d.year); })
        .attr("cy", function (d) { return yScale(d.value); })
        .attr("stroke", function (d, i) {
            return color(d.type);
        })
        .attr("fill", function (d, i) {
            return color(d.type);
        });


        // Add the X Axis
		svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
		svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

		  
		//visFrame.append("rect");

//        // add y axis to svg !


    };
