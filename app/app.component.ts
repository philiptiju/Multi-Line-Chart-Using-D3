import { Component } from "@angular/core";
import * as d3 from "d3";

//declare var d3: any;
@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  gaugemap = {};
  constructor() {}
  ngOnInit() {
    this.draw();
  }

  draw() {
    var chart = function(container, configuration, data) {
      var config = {
        width: 800,
        height: 300,
        margin: 50,
        duration: 350,
        lineOpacity: "1",
        lineOpacityHover: "0.85",
        otherLinesOpacityHover: "0.1",
        lineStroke: "2.5px",
        lineStrokeHover: "3px",
        circleOpacity: "1",
        circleOpacityOnLineHover: "0.25",
        circleRadius: 5,
        circleRadiusHover: 8,
        xAxisTicks: 12,
        yAxisTicks: 12,
        xlabelPadding: 10,
        ylabelPadding: 15,
        tickSizeInner: 0,
        tickSizeOuter: 0,
        yAxixText: "Y AXIS TEXT",
        color : ["#E22C43", "#0073D0"],
        timeFormat: "%y"
      };

      function configure(configuration) {
        var prop = undefined;
        for (prop in configuration) {
          config[prop] = configuration[prop];
        }
      }

      configure(configuration);

      /* Format Data */
      var parseDate = d3.timeParse(config.timeFormat);
      data.forEach(function(d) {
        d.values.forEach(function(d) {
          d.date = parseDate(d.date);
          if (!isNaN(d.price)) {
            d.price = +d.price;
          }
        });
      });

      /* Scale */
      var xScale = d3
        .scaleTime()
        .domain(d3.extent(data[0].values, d => d.date))
        .range([0, config.width - config.margin]);

      var yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data[0].values, d => d.price)])
        .range([config.height - config.margin, 0]);

      
      /* Add SVG */
      var svg = d3
        .select(container)
        .append("svg")
        .attr("width", config.width + config.margin + "px")
        .attr("height", config.height + config.margin + "px")
        .append("g")
        .attr("transform", `translate(${config.margin}, ${config.margin})`);

      svg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("x", -20)
        .attr("y", -30)
        .attr("fill", "#F6F9FE");

      /* Add line into SVG */
      var line = d3
        .line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.price));
      let lines = svg.append("g").attr("class", "lines");

      lines
        .selectAll(".line-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "line-group")
        .on("mouseover", function(d, i) {
          svg
            .append("text")
            .attr("class", "title-text")
            .style("fill", config.color[i % config.color.length])
            .text(d.name)
            .attr("text-anchor", "middle")
            .attr("x", (config.width - config.margin) / 2)
            .attr("y", 5);
        })
        .on("mouseout", function(d) {
          svg.select(".title-text").remove();
        })
        .append("path")
        //.attr("class", "line")
        .attr("class", function(d, i) {
          return "line line" + i;
        })
        .attr("d", function(d) {
          return line(d.values.filter(x => !isNaN(x.price)));
        })
        .style("stroke", (d, i) => config.color[i % config.color.length])
        .style("opacity", config.lineOpacity)
        .on("mouseover", function(d) {
          d3.selectAll(".line").style("opacity", config.otherLinesOpacityHover);
          d3.selectAll(".circle").style(
            "opacity",
            config.circleOpacityOnLineHover
          );
          d3.select(this)
            .style("opacity", config.lineOpacityHover)
            .style("stroke-width", config.lineStrokeHover)
            .style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
          d3.selectAll(".line").style("opacity", config.lineOpacity);
          d3.selectAll(".circle").style("opacity", config.circleOpacity);
          d3.select(this)
            .style("stroke-width", config.lineStroke)
            .style("cursor", "none");
        });

      /* Add circles in the line */
      lines
        .selectAll("circle-group")
        .data(data)
        .enter()
        .append("g")
        .style("fill", "white")
        .style("stroke", (d, i) => config.color[i % config.color.length])
        .style("stroke-width", "2.5")
        .selectAll("circle")
        .data(d => d.values)
        .enter()
        .append("g")
        .attr("class", "circle")
        .append("circle")
        .attr("class", function(d) {
          return d.price === undefined ? "NaN" : d.price;
        })
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.price))
        .attr("r", config.circleRadius)
        .style("opacity", config.circleOpacity)
        .on("mouseover", function(d) {
          d3.select(this)
            .transition()
            .duration(config.duration)
            .attr("r", config.circleRadiusHover);
        })
        .on("mouseout", function(d) {
          d3.select(this)
            .transition()
            .duration(config.duration)
            .attr("r", config.circleRadius);
        });

      //Add Text
      lines
        .selectAll("circle-group")
        .data(data)
        .enter()
        .append("g")
        .style("fill", (d, i) => config.color[i % config.color.length])
        .selectAll("circle")
        .data(function(d) {
          return d.values;
        })
        .data(d => d.values)
        .enter()
        .append("g")
        .attr("class", "circle")
        .append("text")
        .attr("x", function(d) {
          return xScale(d.date) - config.xlabelPadding;
        })
        .attr("y", function(d) {
          return isNaN(yScale(d.price))
            ? 0
            : yScale(d.price) - config.ylabelPadding;
        })
        .attr("class", "text")
        .text(function(d) {
          return d.price;
        });

      /* Add Axis into SVG */
      var xAxis = d3
        .axisBottom(xScale)
        .ticks(config.xAxisTicks)
        .tickFormat(d3.timeFormat(config.timeFormat))
        .tickSizeOuter(config.tickSizeOuter)
        .tickSizeInner(config.tickSizeInner);
      var yAxis = d3.axisLeft(yScale).ticks(config.yAxisTicks);

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${config.height - config.margin})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove());

      svg
        .append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .append("text")
        .attr("x", -(config.height/2) + 50)
        .attr("y", -30)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .text(config.yAxixText);

      // add the Y gridlines
      svg
        .append("g")
        .attr("class", "grid")
        .call(
          make_y_gridlines()
            .tickSize(-config.width)
            .tickFormat("")
        );

      // gridlines in x axis function
      function make_x_gridlines() {
        return d3.axisBottom(xScale).ticks(5);
      }

      // gridlines in y axis function
      function make_y_gridlines() {
        return d3.axisLeft(yScale).ticks(5);
      }

      for (var i=0; i< data.length; i++) {
          let totalLength = svg.select('.line' + i).node().getTotalLength();
            svg.select('.line' + i)
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition() // Call Transition Method
          .duration(4000) // Set Duration timing (ms)
          .attr("stroke-dashoffset", 0);
      }

     

    };

    var data = [
      {
        name: "All Agents",
        values: [
          { date: "JAN", price: 100 },
          { date: "FEB", price: 10 },
          { date: "MAR", price: 145 },
          { date: "APR", price: 241 },
          { date: "MAY", price: 101 },
          { date: "JUN", price: 90 },
          { date: "JUL", price: 10 },
          { date: "AUG", price: 35 },
          { date: "SEP", price: 21 },
          { date: "OCT", price: 201 },
          { date: "NOV" },
          { date: "DEC" }
        ]
      },
      {
        name: "You",
        values: [
          { date: "JAN", price: 200 },
          { date: "FEB", price: 120 },
          { date: "MAR", price: 33 },
          { date: "APR", price: 21 },
          { date: "MAY", price: 51 },
          { date: "JUN", price: 190 },
          { date: "JUL", price: 120 },
          { date: "AUG", price: 85 },
          { date: "SEP", price: 221 },
          { date: "OCT", price: 101 },
          { date: "NOV" },
          { date: "DEC" }
        ]
      }
    ];

    var lineChart = chart("#chart",
      {
        width: 800,
        xAxisTicks: 12,
        yAxisTicks: 0,
        yAxixText: "Number of Post",
        color : ["#E22C43", "#0073D0"],
        timeFormat: "%b"
      },
      data
    );
  }
}
