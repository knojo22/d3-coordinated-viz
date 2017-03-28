/* JavaScript by Jon Fok, 2017 */

window.onload = setMap();
function setMap(){

  // Creating map frame dimensions
  var width = 960,
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
      .defer(d3.json, "data/ContinentalUS_CT.topojson")
      // Loading spatial data
      .defer(d3.json, "data/DC_Metropolitan.topojson")
      .await(callback);

  function callback(error, csvData, unitedstates, dcmetropolitan){
    // Creating a generator for the graticule
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

    // Examining the results to ensure that the callback parameters are loaded properly
    console.log(error);
    console.log(csvData);

    // Translating the United States and Washington DC TopoJSONs to GeoJSONs
    var us = topojson.feature(unitedstates, unitedstates.objects.ContinentalUS_CT),
        dcArea = topojson.feature(dcmetropolitan, dcmetropolitan.objects.DC_Metropolitan).features;

    // Adding the United States Census Tracts to the map
    var states = map.append("path")
        .datum(us)
        .attr("class", "states")
        .attr("d", path);

    // Adding the census tracts for the Washington DC Metropolitan Area
    var censustracts = map.selectAll(".CensusTract")
        .data(dcArea)
        .enter()
        .append("path")
        .attr("class", function(d){
          return "CensusTract " + d.properties.NAME;
        })
        .attr("d", path);

    console.log(us);
    console.log(dcArea);
  };
};
