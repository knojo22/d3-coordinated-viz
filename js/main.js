/* JavaScript by Jon Fok, 2017 */
(function(){

// Creating pseudo-global variables for the map and the bar chart
var householdsize = ["P1HH","P2HH","P3HH","P4HH"];
var vehicle = ["0V","1V","2V","3V","4V"];
var year = ["15","14","13","12","11"];

var currenthousehold = householdsize[0]
var currentvehicle = vehicle[0]
var currentyear = year[0]

var attrArray = ["P1HH0V_15","P1HH0V_14","P1HH0V_13","P1HH0V_12","P1HH0V_11","P1HH1V_15","P1HH1V_14","P1HH1V_13","P1HH1V_12","P1HH1V_11","P1HH2V_15","P1HH2V_14","P1HH2V_13","P1HH2V_12","P1HH2V_11","P1HH3V_15","P1HH3V_14","P1HH3V_13","P1HH3V_12","P1HH3V_11","P1HH4V_15","P1HH4V_14","P1HH4V_13","P1HH4V_12","P1HH4V_11","P2HH0V_15","P2HH0V_14","P2HH0V_13","P2HH0V_12","P2HH0V_11","P2HH1V_15","P2HH1V_14","P2HH1V_13","P2HH1V_12","P2HH1V_11","P2HH2V_15","P2HH2V_14","P2HH2V_13","P2HH2V_12","P2HH2V_11","P2HH3V_15","P2HH3V_14","P2HH3V_13","P2HH3V_12","P2HH3V_11","P2HH4V_15","P2HH4V_14","P2HH4V_13","P2HH4V_12","P2HH4V_11","P3HH0V_15","P3HH0V_14","P3HH0V_13","P3HH0V_12","P3HH0V_11","P3HH1V_15","P3HH1V_14","P3HH1V_13","P3HH1V_12","P3HH1V_11","P3HH2V_15","P3HH2V_14","P3HH2V_13","P3HH2V_12","P3HH2V_11","P3HH3V_15","P3HH3V_14","P3HH3V_13","P3HH3V_12","P3HH3V_11","P3HH4V_15","P3HH4V_14","P3HH4V_13","P3HH4V_12","P3HH4V_11","P4HH0V_15","P4HH0V_14","P4HH0V_13","P4HH0V_12","P4HH0V_11","P4HH1V_15","P4HH1V_14","P4HH1V_13","P4HH1V_12","P4HH1V_11","P4HH2V_15","P4HH2V_14","P4HH2V_13","P4HH2V_12","P4HH2V_11","P4HH3V_15","P4HH3V_14","P4HH3V_13","P4HH3V_12","P4HH3V_11","P4HH4V_15","P4HH4V_14","P4HH4V_13","P4HH4V_12","P4HH4V_11"]
var expressed = attrArray[0];

// Creating the parameters for the chart area
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 470,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

// Creating a scale to proportionally size the bars to the frame and for the axis
var yScale = d3.scaleLinear()
    .range([chartInnerHeight, 0])
    .domain([0,100]);

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
        .center([20.00, 38.925])
        .rotate([97.36, 0, 0])
        .parallels([29.5, 45.5])
        .scale(23000)
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

  function callback(error, csvData, unitedstates, dcmetropolitan, attribute){
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

    // Adding dropdown box to the map
    createDropdown(csvData);

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
        return "CensusTract " + "c" + d.properties.GEOID;
      })
      .attr("d", path)
      .style("fill", function(d){
        return colorScale(d.properties, colorScale);
      })
      .on("mouseover", function(d){
        highlight(d.properties);
      })
      .on("mouseout", function(d){
        dehighlight(d.properties);
      })
      .on("mousemove", moveLabel);

  var desc = censustracts.append("desc")
      .text('{"stroke": "#000", "stroke-width": "0.5px"}');
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

  // Defining the bars for each Census Tract
  var bars = chart.selectAll(".bars")
      .data(csvData)
      .enter()
      .append("rect")
      .sort(function(a,b){
        return b[expressed] - a[expressed]
      })
      .attr("class", function(d){
        return "bars " + "c" + d.CT;
      })
      .attr("width", chartInnerWidth / csvData.length)
      .on("mouseover", highlight)
      .on("mouseout", dehighlight)
      .on("mousemove", moveLabel);

  var desc = bars.append("desc")
      .text('{"stroke": "none", "stroke-width": "0px"}');

  // Creating a text element for the bar chart title
  var chartTitle = chart.append("text")
      .attr("x", 85)
      .attr("y", 40)
      .attr("class", "chartTitle")
      .text("Percentage of " + currenthousehold[1] + " Person(s) Households with " + currentvehicle[0] + " Vehicle(s) for " + "20"+currentyear);

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

  updateChart(bars,csvData.length, colorScale);
};

// Defining a function to create a dropdown menu for the attributes
function createDropdown(csvData){

  // Adding a select element for household size
  var dropdownhousehold = d3.select("body")
      .append("select")
      .attr("class", "dropdown")
      .on("change", function(){
          changeAttribute(this.value, csvData)
      });

  // Adding attribute options for the dropdown menu
  var attrOptions = dropdownhousehold.selectAll("attrOptions")
      .data(householdsize)
      .enter()
      .append("option")
      .attr("value", function(d){
        return d
      })
      .text(function(d){
        return d[1] + " Person(s) Households"
      });

  // Adding a select element for household vehicles available
  var dropdownvehicle = d3.select("body")
      .append("select")
      .attr("class", "dropdown2")
      .on("change", function(){
          changeAttribute(this.value, csvData)
      });

  // Adding attribute options for the dropdown menu
  var attrOptions2 = dropdownvehicle.selectAll("attrOptions")
      .data(vehicle)
      .enter()
      .append("option")
      .attr("value", function(d){
        return d
      })
      .text(function(d){
        return d[0] + " Vehicle(s)"
      });

  // Adding a select element for year
  var dropdownyear  = d3.select("body")
      .append("select")
      .attr("class", "dropdown3")
      .on("change", function(){
          changeAttribute(this.value, csvData)
      });

  // Adding attribute options for the dropdown menu
  var attrOptions3 = dropdownyear.selectAll("attrOptions")
      .data(year)
      .enter()
      .append("option")
      .attr("value", function(d){
        return d
      })
      .text(function(d){
        return "20"+d
      });
};

// Defining a function to update the choropleth map when the attribute is changed from the dropdown menu
function changeAttribute(attribute, csvData){
  // Creating an "if" statement to account for updating dropdown values for each dropdown menu
  if (attribute.indexOf("P") > -1){
    currenthousehold = attribute
  } else if (attribute.indexOf("V") > -1){
    currentvehicle = attribute
  } else {
    currentyear = attribute
  };

  // Combining all of the attribute values into the expressed input for the map and the bar chart
  expressed = currenthousehold + currentvehicle + "_" + currentyear;

  var colorScale = makeColorScale(csvData);

  var censustracts = d3.selectAll(".CensusTract")
      .style("fill", function(d){
        return choropleth(d.properties, colorScale);
      });

  // Updating the values for each bar in the bar chart and creating an animation for visual feedback of the change
  var bars = d3.selectAll(".bars")
      .sort(function(a,b){
        return b[expressed]-a[expressed];
      })
      .transition()
      .delay(function(d,i){
        return i * 20
      })
      .duration(1000);

  updateChart(bars, csvData.length, colorScale);
};

// Defining a function to update the bar chart when the dropdown menu attribute is changed
function updateChart(bars, n, colorScale){
  bars.attr("x", function(d, i){
          return i * (chartInnerWidth / n) + leftPadding;
      })
      // Resizing the bars in the chart based upon the update
      .attr("height", function(d, i){
          return chartInnerHeight - yScale(parseFloat(d[expressed]));
      })
      .attr("y", function(d, i){
          return yScale(parseFloat(d[expressed])) + topBottomPadding;
      })
      // Recoloring the bars in the chart based upon the update
      .style("fill", function(d){
          return choropleth(d, colorScale);
      });

  var chartTitle = d3.selectAll(".chartTitle")
      .text("Percentage of " + currenthousehold[1] + " Person(s) Households with " + currentvehicle[0] + " Vehicle(s) for " + "20"+currentyear);
};

// Defining a function to highlight the census tract on the map and the bar chart
function highlight(props){
  // Changing the stroke of the highlighted Census Tract
  var selected = d3.selectAll("." + "c" + props.CT)
    .style("stroke", "blue")
    .style("stroke-width", "2");

  var selected2 = d3.selectAll("." + "c" + props.GEOID)
    .style("stroke", "blue")
    .style("stroke-width", "2");

  setLabel(props);
};

// Defining a function to dehighlight the census tract on the map and the bar chart
function dehighlight(props){
  var selected = d3.selectAll("." + "c" + props.CT)
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });

  function getStyle(element, styleName){
      var styleText = d3.select(element)
          .select("desc")
          .text();

      var styleObject = JSON.parse(styleText);

      return styleObject[styleName];
  };

  d3.select(".infolabel")
      .remove();

  var selected2 = d3.selectAll("." + "c" + props.GEOID)
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });

  function getStyle(element, styleName){
      var styleText = d3.select(element)
          .select("desc")
          .text();

      var styleObject = JSON.parse(styleText);

      return styleObject[styleName];
  };

  d3.select(".infolabel")
      .remove();
};

// Defining a function to set the label of the census tract on the map and the bar chart
function setLabel(props){
  var labelAttribute = "<h1><b>" + props[expressed] + "%"+
      "</h1></b>";

  // Creating the info label div for the attribute and the associated census tract
  var infolabel = d3.select("body")
      .append("div")
      .attr("class", "infolabel")
      .html(labelAttribute);

  var censustractName = infolabel.append("div")
      .attr("class", "labelname")
      .html("Census Tract: " + props.NAME);
};

// Defining a function to allow the label to move depending on the location  of the census tract on the map or the bar chart
function moveLabel(){
    // Getting the width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    // Using the coordinates to set label coordinates when mousing over
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    // Creating the horizontal label coordinate & testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    // Creating the vertical label coordinate & testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1;

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

})();
