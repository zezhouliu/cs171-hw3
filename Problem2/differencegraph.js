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

        var convertToInt = function (s) {
            return parseInt(s.replace(/,/g, ""), 10);
        };

        data.forEach(function (d, i) {
            d.USCensus = convertToInt(d.USCensus);
            d.PopulationBureau = convertToInt(d.PopulationBureau);
            d.UN = convertToInt(d.UN);
            d.HYDE = convertToInt(d.HYDE);
            d.Maddison = convertToInt(d.Maddison);
        });

        var min_year = d3.min(data, function (d) { return d.year; });
        var max_year = d3.max(data, function (d) { return d.year; });

        var xAxis, xScale, yAxis, yScale;

        // define the scale and axis for x
        xScale = d3.scale.linear().domain([min_year, max_year]).range([0, bbVis.w]);  
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

        var min_value = 0;

        // filter out the values for each category
        var data_USCensus = data.filter(function (d, i) { return d.USCensus; });
        var data_populationBureau = data.filter(function (d, i) { return d.PopulationBureau; });
        var data_UN = data.filter(function (d, i) { return d.UN; });
        var data_HYDE = data.filter(function (d, i) { return d.HYDE; });
        var data_Maddison = data.filter(function (d, i) { return d.Maddison; });

        // get the max of each category
        var extent_census = d3.extent(data_USCensus, function (d) { return d.USCensus; });
        var extent_populationbureau = d3.extent(data_populationBureau, function (d) { return d.PopulationBureau; });
        var extent_UN = d3.extent(data_UN, function (d) { return d.UN; });
        var extent_HYDE = d3.extent(data_HYDE, function (d) { return d.HYDE; });
        var extent_Maddison = d3.extent(data_Maddison, function (d) { return d.Maddison; });

        console.log(extent_census);
        console.log(extent_populationbureau);
        console.log(extent_UN);
        console.log(extent_HYDE);
        console.log(extent_Maddison);

        var max_value = Math.max(extent_census[1], extent_populationbureau[1], extent_UN[1], extent_HYDE[1], extent_Maddison[1]);

        // define the scale and axis for y
        yScale = d3.scale.linear().domain([max_value, min_value]).range([0, height]);
        yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(7);

        var color = d3.scale.category10();
        var datasets = [];
        datasets.push(data_USCensus, data_populationBureau, data_UN, data_HYDE, data_Maddison);
        var extents = [];
        extents.push(extent_census, extent_populationbureau, extent_UN, extent_HYDE, extent_Maddison);

        var keys = ["USCensus", "PopulationBureau", "UN", "HYDE", "Maddison"];

        // interpolate for each dataset
        var interpolate = function (i) {
            
            var year_extent = d3.extent(datasets[i], function (d) { return d.year; });
            var estimate = d3.scale.linear().domain(year_extent).range(extents[i]);

            data.forEach(function (d1, i1) {
                if (d1.year > year_extent[0] && d1.year < year_extent[1] && datasets[i].indexOf(d1) == -1) {
                    d1[keys[i]] = estimate(d1.year);
                    datasets[i].push(d1);
                }
            })
        };

        for (var i = 0; i < datasets.length; ++i) {
            interpolate(i);
        }

        var consensusline = d3.svg.line().interpolate("basis")
                        .x(function (d, i) {
                            console.log(d.year);
                            return xScale(d.year);
                        })
                        .y(function (d, i) {
                            return yScale(d.USCensus);
                        });


        svg.selectAll(".line")
            .data(data_USCensus)
            .enter()
            .append("path")
            .attr("class", "line")
            .style("stroke", color(i))
            .attr("d", consensusline);
        

        //var all_datapoints = d3.merge(datasets);
        //svg.selectAll("dot")
        //.data(all_datapoints)
        //.enter().append("circle")
        //.attr("r", 1.5)
        //.attr("cx", function (d) { return xScale(d.year); })
        //.attr("cy", function (d) { return yScale(d.value); })
        //.attr("stroke", function (d, i) {
        //    return color(d.type);
        //})
        //.attr("fill", function (d, i) {
        //    return color(d.type);
        //});


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
