/* JavaScript by Jon Fok, 2017 */

window.onload = function(){
    var w = 1000, h = 500;
    // Creating the <body> element from the DOM
    var container = d3.select("body")
    .append("svg")
    .datum(500)
    .attr("width", w)
    .attr("height", h)
    .attr("class", "container")
    .style("background-color", "rgba(0,0,0,0.2)");

    // Creating the inner Rectangle block
    var innerRect = container.append("rect")
    .datum(400)
    .attr("width", function(d){
      return d*2+100;
    })
    .attr("height", function(d){
      return d;
    })
    .attr("class", "innerRect")
    .attr("x", 50)
    .attr("y", 50)
    .style("fill", "#FFFFFF");

  // Defining the array for the city population and the population values
  var cityPop = [
      {
        city: 'Vancouver',
        population: 631486
      },
      {
        city: 'Edmonton',
        population: 1321426
      },
      {
        city: 'Ottawa',
        population: 934243
      },
      {
        city: 'Quebec City',
        population: 531902
      }
    ];

  var x = d3.scaleLinear()
      .range([90, 800])
      .domain([0,3]);

  // Retrieving the minimum and maximum values from the city population array
  var minPop = d3.min(cityPop, function(d){
      return d.population;
    });

  var maxPop = d3.max(cityPop, function(d){
      return d.population;
    });

  var y = d3.scaleLinear()
        .range([450,50])
        .domain([
          0,1500000
        ]);

  // Creating a variable to define the color of the circles
  var color = d3.scaleLinear()
        .range([
            "#DEEBF7",
            "#3182BD"
        ])
        .domain([
            minPop,
            maxPop
        ]);

  // Creating a variable to create circles based upon the population values
  var circles = container.selectAll(".circles")
        .data(cityPop)
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("id", function(d, i){
          console.log("d:", d, "i:", i);
          return d.city;
        })
        .attr("r", function(d){
          var area = d.population * 0.001;
          return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
          return x(i);
        })
        .attr("cy", function(d){
          return y(d.population);
        })
        .style("fill", function(d, i){
          return color(d.population);
        })
        .style("stroke", "#000");

  var yAxis = d3.axisLeft(y);
  // Creating a vertical axis for the population chart
  var axis = container.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(50,0)");

  yAxis(axis);

  // Creating a variable for the title of the chart
  var title = container.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", function(d){
      return (d*2+50)*0.5;
      console.log(d);
    })
    .attr("y", 30)
    .text("City Populations for Select Cities in Canada");

  // Creating labels for each of the cirlce values
  var labels = container.selectAll(".labels")
    .data(cityPop)
    .enter()
    .append("text")
    .attr("class", "labels")
    .attr("text-anchor", "left")
    .attr("y", function(d){
        // Defining the vertical position centered for each circle
        return y(d.population) + 5;
    })

  // Creating a variable to add city labels to the circles
  var nameLine = labels.append("tspan")
    .attr("class", "nameLine")
    .attr("x", function(d,i){
        // Defining the horizontal position to the right of each circle
        return x(i) + Math.sqrt(d.population * 0.001 / Math.PI) + 5;
    })
    .text(function(d){
        return d.city;
    });

  // Creating a format generator to format the population numbers
  var format = d3.format(",");

  // Creating a variable to add population labels to the circles
  var popLine = labels.append("tspan")
    .attr("class", "popLine")
    .attr("x", function(d,i){
        // Defining the horizontal position to the right of each circle
        return x(i) + Math.sqrt(d.population * 0.001 / Math.PI) + 5;
    })
    .attr("dy", "15")
    .text(function(d){
        return "Pop: " + format(d.population);
    });
};
