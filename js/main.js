/* JavaScript by Jon Fok, 2017 */
(function(){

// Creating pseudo-global variables
var attrArray = ["HHNV_15","HHNV_14","HHNV_13","HHNV_12","HHNV_11","HH1V_15","HH1V_14","HH1V_13","HH1V_12","HH1V_11","HH2V_15","HH2V_14","HH2V_13","HH2V_12","HH2V_11","HH3V_15","HH3V_14","HH3V_13","HH3V_12","HH3V_11","HH4V_15","HH4V_14","HH4V_13","HH4V_12","HH4V_11","P1HHNV_15","P1HHNV_14","P1HHNV_13","P1HHNV_12","P1HHNV_11","P1HH1V_15","P1HH1V_14","P1HH1V_13","P1HH1V_12","P1HH1V_11","P1HH2V_15","P1HH2V_14","P1HH2V_13","P1HH2V_12","P1HH2V_11","P1HH3V_15","P1HH3V_14","P1HH3V_13","P1HH3V_12","P1HH3V_11","P1HH4V_15","P1HH4V_14","P1HH4V_13","P1HH4V_12","P1HH4V_11","P2HHNV_15","P2HHNV_14","P2HHNV_13","P2HHNV_12","P2HHNV_11","P2HH1V_15","P2HH1V_14","P2HH1V_13","P2HH1V_12","P2HH1V_11","P2HH2V_15","P2HH2V_14","P2HH2V_13","P2HH2V_12","P2HH2V_11","P2HH3V_15","P2HH3V_14","P2HH3V_13","P2HH3V_12","P2HH3V_11","P2HH4V_15","P2HH4V_14","P2HH4V_13","P2HH4V_12","P2HH4V_11","P3HHNV_15","P3HHNV_14","P3HHNV_13","P3HHNV_12","P3HHNV_11","P3HH1V_15","P3HH1V_14","P3HH1V_13","P3HH1V_12","P3HH1V_11","P3HH2V_15","P3HH2V_14","P3HH2V_13","P3HH2V_12","P3HH2V_11","P3HH3V_15","P3HH3V_14","P3HH3V_13","P3HH3V_12","P3HH3V_11","P3HH4V_15","P3HH4V_14","P3HH4V_13","P3HH4V_12","P3HH4V_11","P4HHNV_15","P4HHNV_14","P4HHNV_13","P4HHNV_12","P4HHNV_11","P4HH1V_15","P4HH1V_14","P4HH1V_13","P4HH1V_12","P4HH1V_11","P4HH2V_15","P4HH2V_14","P4HH2V_13","P4HH2V_12","P4HH2V_11","P4HH3V_15","P4HH3V_14","P4HH3V_13","P4HH3V_12","P4HH3V_11","P4HH4V_15","P4HH4V_14","P4HH4V_13","P4HH4V_12","P4HH4V_11"]
var expressed = attrArray[5];

window.onload = setMap();
function setMap(){

  // Creating map frame dimensions
  var width = window.innerWidth * 0.5,
      height = 460;

  // Creating a svg container for the map
  var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

  // Defining the map projection parameters using an Albers Equal Area Conic Projection
  var projection = d3.geoAlbers()
        .center([20.00, 38.895])
        .rotate([97.36, 0, 0])
        .parallels([29.5, 45.5])
        .scale(25000)
        .translate([width / 2, height / 2]);

  var path = d3.geoPath()
        .projection(projection);

  // Using d3.queue to perform parallel asynchronous data loading
  d3.queue()
      // Loading attributes from the csv file
      .defer(d3.csv, "data/DC_Metropolitan.csv")
      // Loading background spatial data
      .defer(d3.json, "data/DC_States.topojson")
      // Loading spatial data
      .defer(d3.json, "data/DC_Metropolitan.topojson")
      .await(callback);

  function callback(error, csvData, unitedstates, dcmetropolitan){
    // Creating a generator for the graticule

    setGraticule(map, path);

    // Examining the results to ensure that the callback parameters are loaded properly
    console.log(error);
    console.log(csvData);

    // Translating the United States and Washington DC TopoJSONs to GeoJSONs
    var us = topojson.feature(unitedstates, unitedstates.objects.DC_States),
        dcArea = topojson.feature(dcmetropolitan, dcmetropolitan.objects.DC_Metropolitan).features;

    // Adding the United States pertaining to the DC area to the map
    var states = map.append("path")
        .datum(us)
        .attr("class", "states")
        .attr("d", path);

    // Joining the csv data to the Washington DC geoJSON
    dcArea = joinData(dcArea, csvData);

    // Examining the results to ensure that the join was done properly
    console.log(dcArea);
    var colorScale = makeColorScale(csvData);

    // Adding enumeration units to the map
    setEnumerationUnits(dcArea, map, path, colorScale);

    // Adding coordinated visualization to the map
    setChart(csvData, colorScale);
  };
};

// Defining a function for the graticules and the graticules background for the map
function setGraticule(map, path){
  var graticule = d3.geoGraticule()
    .step([5,5]);

  // Creating a background for the graticules
  var gratBackground = map.append("path")
    .datum(graticule.outline())
    .attr("class", "gratBackground")
    .attr("d", path);

  // Creating the graticules for the map
  var gratLines = map.selectAll(".gratLines")
    .data(graticule.lines())
    .enter()
    .append("path")
    .attr("class", "gratLines")
    .attr("d", path);

};

// Defining a function to join the DC Metropolitan csv data to the geoJSON
function joinData(dcArea, csvData){
  // Looping through the csv to assign each set of csv attribute values to the geoJSON Census Tracts
  for (var i=0; i<csvData.length; i++){
    var csvCensusTract = csvData[i];
    var csvKey = csvCensusTract.CT;

    // Looping through the geoJSON Census Tracts to find the correct Census Tracts
    for (var a=0; a<dcArea.length; a++){

      var geojsonProps = dcArea[a].properties;
      var geojsonKey = geojsonProps.GEOID;

      // Transferring the csv data to the geoJSON properties object when the keys match
      if (geojsonKey == csvKey){
        // Assigning all of the attributes and values
        attrArray.forEach(function(attr){
          var val = parseFloat(csvCensusTract[attr]);
          geojsonProps[attr] = val;
        });
      };
    };
  };
  return dcArea;
};

// Defining a function to create a color scale generator for the spatial data
function makeColorScale(data){
  var colorClasses = [
    "#feedde",
    "#fdbe85",
    "#fd8d3c",
    "#e6550d",
    "#a63603"
  ];

  // Creating a color scale generator for the census tracts
  var colorScale = d3.scaleQuantile()
      .range(colorClasses);

  // Creating a two-value array of the minimum and maximum attribute values
  var minmax = [
      d3.min(data, function(d) { return parseFloat(d[expressed]); }),
      d3.max(data, function(d) { return parseFloat(d[expressed]); })
  ];

  colorScale.domain(minmax);

  return colorScale;
};

// Defining a function to create the enumeration units for the census tracts
function setEnumerationUnits(dcArea, map, path, colorScale){

  // Adding the census tracts for the Washington DC Metropolitan Area
  var censustracts = map.selectAll(".CensusTract")
      .data(dcArea)
      .enter()
      .append("path")
      .attr("class", function(d){
        return "CensusTract " + d.properties.NAME;
      })
      .attr("d", path)
      .style("fill", function(d){
        return colorScale(d.properties[expressed]);
      });
};


// Defining a function to retun a color based upon the data value
function choropleth(props, colorScale){
  var val = parseFloat(props[expressed]);
  if (typeof val == 'number' && !isNaN(val)){
    return colorScale(val);
  } else {
    return "#CCC";
  };
};

// Defining a function to create a coordinated bar chart
function setChart(csvData, colorScale){
  var chartWidth = window.innerWidth * 0.425,
      chartHeight = 470,
      leftPadding = 25,
      rightPadding = 2,
      topBottomPadding = 5,
      chartInnerWidth = chartWidth - leftPadding - rightPadding,
      chartInnerHeight = chartHeight - topBottomPadding * 2,
      translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

  // Creating another svg element for the bar chart
  var chart = d3.select("body")
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("class", "chart");

  // Creating a rectangle for the chart backgroun
  var chartBackground = chart.append("rect")
      .attr("class", "chartBackground")
      .attr("width", chartInnerWidth)
      .attr("height", chartInnerHeight)
      .attr("transform", translate);

  // Creating a scale to proportionally size the bars to the frame and for the axis
  var yScale = d3.scaleLinear()
      .range([chartInnerHeight, 0])
      .domain([0,1]);

  // Defining the bars for each Census Tract
  var bars = chart.selectAll(".bars")
      .data(csvData)
      .enter()
      .append("rect")
      .sort(function(a,b){
        return b[expressed] - a[expressed]
      })
      .attr("class", function(d){
        return "bars " + d.CT;
      })
      .attr("width", chartInnerWidth / csvData.length)
      .attr("x", function(d, i){
        return i * (chartInnerWidth / csvData.length) + leftPadding;
      })
      .attr("height", function(d){
        return chartInnerHeight - yScale(parseFloat(d[expressed]));
      })
      .attr("y",function(d){
        return yScale(parseFloat(d[expressed])) + topBottomPadding;
      })
      .style("fill", function(d){
        return choropleth(d, colorScale);
      });

  // Creating a text element for the bar chart title
  var chartTitle = chart.append("text")
      .attr("x", 40)
      .attr("y", 40)
      .attr("class", "chartTitle")
      .text("Percentage of " + expressed[0] + expressed[1]+"s" + " with " + expressed[2] + expressed[3] + " for " + "20"+expressed[5] + expressed[6]);

  // Creating a vertical axis generator for the bar chart
  var yAxis = d3.axisLeft()
      .scale(yScale);

  // Placing the axis
  var axis = chart.append("g")
      .attr("class", "axis")
      .attr("transform", translate)
      .call(yAxis);

  // Creating a frame for the chart border
  var chartFrame = chart.append("rect")
      .attr("class", "chartFrame")
      .attr("width", chartInnerWidth)
      .attr("height", chartInnerHeight)
      .attr("transform", translate);
};
})();
