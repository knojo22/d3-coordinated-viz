/* JavaScript by Jon Fok, 2017 */
(function(){

var attrArray = ["HH15","HH14","HH13","HH12","HH11","HHNV_15","HHNV_14","HHNV_13","HHNV_12","HHNV_11","HH1V_15","HH1V_14","HH1V_13","HH1V_12","HH1V_11","HH2V_15","HH2V_14","HH2V_13","HH2V_12","HH2V_11","HH3V_15","HH3V_14","HH3V_13","HH3V_12","HH3V_11","HH4V_15","HH4V_14","HH4V_13","HH4V_12","HH4V_11","P1HH_15","P1HH_14","P1HH_13","P1HH_12","P1HH_11","P1HHNV_15","P1HHNV_14","P1HHNV_13","P1HHNV_12","P1HHNV_11","P1HH1V_15","P1HH1V_14","P1HH1V_13","P1HH1V_12","P1HH1V_11","P1HH2V_15","P1HH2V_14","P1HH2V_13","P1HH2V_12","P1HH2V_11","P1HH3V_15","P1HH3V_14","P1HH3V_13","P1HH3V_12","P1HH3V_11","P1HH4V_15","P1HH4V_14","P1HH4V_13","P1HH4V_12","P1HH4V_11","P2HH_15","P2HH_14","P2HH_13","P2HH_12","P2HH_11","P2HHNV_15","P2HHNV_14","P2HHNV_13","P2HHNV_12","P2HHNV_11","P2HH1V_15","P2HH1V_14","P2HH1V_13","P2HH1V_12","P2HH1V_11","P2HH2V_15","P2HH2V_14","P2HH2V_13","P2HH2V_12","P2HH2V_11","P2HH3V_15","P2HH3V_14","P2HH3V_13","P2HH3V_12","P2HH3V_11","P2HH4V_15","P2HH4V_14","P2HH4V_13","P2HH4V_12","P2HH4V_11","P3HH_15","P3HH_14","P3HH_13","P3HH_12","P3HH_11","P3HHNV_15","P3HHNV_14","P3HHNV_13","P3HHNV_12","P3HHNV_11","P3HH1V_15","P3HH1V_14","P3HH1V_13","P3HH1V_12","P3HH1V_11","P3HH2V_15","P3HH2V_14","P3HH2V_13","P3HH2V_12","P3HH2V_11","P3HH3V_15","P3HH3V_14","P3HH3V_13","P3HH3V_12","P3HH3V_11","P3HH4V_15","P3HH4V_14","P3HH4V_13","P3HH4V_12","P3HH4V_11","P4HH_15","P4HH_14","P4HH_13","P4HH_12","P4HH_11","P4HHNV_15","P4HHNV_14","P4HHNV_13","P4HHNV_12","P4HHNV_11","P4HH1V_15","P4HH1V_14","P4HH1V_13","P4HH1V_12","P4HH1V_11","P4HH2V_15","P4HH2V_14","P4HH2V_13","P4HH2V_12","P4HH2V_11","P4HH3V_15","P4HH3V_14","P4HH3V_13","P4HH3V_12","P4HH3V_11","P4HH4V_15","P4HH4V_14","P4HH4V_13","P4HH4V_12","P4HH4V_11"];
var expressed = attrArray[0];

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
    // console.log(error);
    console.log(csvData);

    // Translating the United States and Washington DC TopoJSONs to GeoJSONs
    var us = topojson.feature(unitedstates, unitedstates.objects.DC_States),
        dcArea = topojson.feature(dcmetropolitan, dcmetropolitan.objects.DC_Metropolitan).features;

    // Adding the United States pertaining to the DC area to the map
    var states = map.append("path")
        .datum(us)
        .attr("class", "states")
        .attr("d", path);

    dcArea = joinData(dcArea, csvData);

    var colorScale = makeColorScale(csvData);

    // Adding enumeration units to the map
    setEnumerationUnits(dcArea, map, path, colorScale);

    // Adding coordinated visualization to the map
    setChart(csvData, colorScale);

  };
};

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

function joinData(dcArea, csvData){
  for (var i=0; i<csvData.length; i++){
    var csvCensusTract = csvData[i];
    var csvKey = csvCensusTract.CT;

    for (var a = 0; a < dcArea.length; a++){

      var geojsonProps = dcArea[a].properties;
      var geojsonKey = geojsonProps.GEOID;

      if (geojsonKey == csvKey){
        attrArray.forEach(function(attr){
          var val = parseFloat(csvCensusTract[attr]);
          geojsonProps[attr] = val;
        });
      };
    };
  };
  return dcArea;
};

function makeColorScale(data){
  var colorClasses = [
    "#D4B9DA",
    "#C994C7",
    "#DF65B0",
    "#DD1C77",
    "#980043"
  ];

  var colorScale = d3.scaleQuantile()
      .range(colorClasses);

  //build two-value array of minimum and maximum expressed attribute values
  var minmax = [
      d3.min(data, function(d) { return parseFloat(d[expressed]); }),
      d3.max(data, function(d) { return parseFloat(d[expressed]); })
  ];
  //assign two-value array as scale domain
  colorScale.domain(minmax);

  return colorScale;
};

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

function choropleth(props, colorScale){
  var val = parseFloat(props[expressed]);
  if (typeof val == 'number' && !isNaN(val)){
    return colorScale(val);
  } else {
    return "#CCC";
  };
};

function setChart(csvData, colorScale){
  var chartWidth = window.innerWidth * 0.425,
      chartHeight = 460;

  var chart = d3.select("body")
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("class", "chart");

  var bars = chart.selectAll('.bars')
      .data(csvData)
      .enter()
      .append("rect")
      .attr("class", function(d){
        return "bars " + d.CT;
      })
      .attr("width", chartWidth/csvData.length)
      .attr("x", function(d, i){
        return i * (chartWidth/csvData.length);
      })
      .attr("height", 460)
      .attr("y", 0);
};
})();
