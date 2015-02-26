define(['jquery', 'd3', 'model', 'event', 'config', 'controller'], function(jQuery, d3, model, event, config, controller) {

  var colors = {
    "root": "#ffffff",
    "prerequisite": "#5687d1",
    "nextSteps": "#7b615c",
    "topics": "#6ab975",
    "related": "#a173d1"
  };

  var init = function() {

    event.listen(event.modelUpdateEvent, function(e, d) { 
      // draw children on original graph
      root = d;
      // fade out all text elements
      if(g) {
        g.transition().duration(500)
          .style('opacity', 0);

        setTimeout(function(){ update(); }, 500);

      }else{ //first time render
        update();
      }    

    });

    $("body").load("/lib/modules/template/main-view.html", function() {
      controller.init();
    });
    

    //$("body").html("<button id='course-button' class='control-button' type='button'>get course</button><div class='more-info'> loading ... </div><div class='details-container'><div class='details'></div></div>");


    var width = $('.graph-container').width(),
      height = $('.graph-container').height(),
      root;

    var radius = Math.min(width, height) / 2;
    var svg, g, path, text;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
        .range([0, radius]);

    var color = d3.scale.category20c();


    var partition = d3.layout.partition()
        .sort(null)
        .value(function(d) { return d.size; }); //sizing

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

    // Keep track of the node that is currently being displayed as the root.
    var node;

    function update() {
      d3.select("svg").remove();
      width = $('.graph-container').width();
      height = $('.graph-container').height();
      radius = Math.min(width, height) / 2;
      y = d3.scale.sqrt()
        .range([0, radius]);
      arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

      console.dir(width + ' ' + height);

      svg = d3.select(".graph-container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "main-graph")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      g = svg.selectAll("g")
          .data(partition.nodes(root))
        .enter().append("g")
          .style('opacity', 0)
          .attr("class", "segment");

      path = g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return colors[d.group]; })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", click);

      var rootR = $(".segment")[0].getBoundingClientRect().width / 2;
      var padding = rootR * (1 - 1 / Math.sqrt(2));

      $(".right-panel").height(rootR * 2);
      $(".right-panel").width(rootR * 2);
      $(".right-panel").offset($(".segment")[0].getBoundingClientRect());

      mouseleave(root);
             
      text = g.append("text")
        .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
        .attr("x", function(d) { return y(d.y); })
        .attr("dx", "6") // margin
        .attr("dy", ".35em") // vertical-align
        .text(function(d) { 
          if (d.depth) {
            return d.name;
          } else {
            return "";
          } 
        });

      g.filter(filterNonRoot).transition().duration(500)
           .style('opacity', 1);
           
      d3.select(self.frameElement).style("height", height + "px");

      function filterNonRoot (d) {
        return (d.depth > 0);
      }

      // Restore everything to full opacity when moving off the visualization.
      function mouseleave(d) {
        g.filter(filterNonRoot).style("opacity", 1);
        $(".more-info").text(root.moreInfo.get('description'));
        $(".details").empty();
        $(".details").append("<div class='code'>" + root.moreInfo.get('code') + "</div>");
        $(".details").append("<div class='title'>" + root.moreInfo.get('title') + "</div>");
        $(".details").append("<div class='instructor'>" + root.moreInfo.get('instructor') + "</div>");
        $(".details").append("<div class='distribution'>" + root.moreInfo.get('distribution') + "</div>");
      }

      function mouseover(d) {
        if (d.depth) {
          var sequenceArray = getAncestors(d);

          // Fade all the segments.
          g.filter(filterNonRoot).style("opacity", 0.3);

          // Then highlight only those that are an ancestor of the current segment.
          g.filter(filterNonRoot).filter(function(node) {
            return (sequenceArray.indexOf(node) > 0);
          })
            .style("opacity", 1);
        }

        if (d.depth === 2 && d.group === "related") {
          $(".more-info").text(d.moreInfo.get('description'));
          $(".details").empty();
          $(".details").append("<div class='code'>" + d.moreInfo.get('code') + "</div>");
          $(".details").append("<div class='title'>" + d.moreInfo.get('title') + "</div>");
          $(".details").append("<div class='instructor'>" + d.moreInfo.get('instructor') + "</div>");
          $(".details").append("<div class='distribution'>" + d.moreInfo.get('distribution') + "</div>");
        }

        if (d.depth === 1) {
          $(".details").html("<div class='categorical'>" + d.name + "</div>");
        }

        if (d.depth === 2 && d.group === "topics") {
          $(".details").html("<div class='topic'>" + d.name + "</div>");
        }
      }

      function click(d) {

        if(!d.children) {
          if (d.group === "related") {
            //model.exploreCourse(d);
            model.exploreCourse(d);
          } else if (d.group === "topics") {
            model.getRelatedConceptsFromCourse(d);
          }
        }
      }
    }

    // Given a node in a partition layout, return an array of all of its ancestor
    // nodes, highest first, but excluding the root.
    function getAncestors(node) {
      var path = [];
      var current = node;
      while (current.parent) {
        path.unshift(current);
        current = current.parent;
      }
      path.unshift(current);
      return path;
    }

    // Interpolate the scales!
    function arcTween(d) {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d, i) {
        return i
            ? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function computeTextRotation(d) {
      return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }

  };

  return {
    init: init
  };
});
