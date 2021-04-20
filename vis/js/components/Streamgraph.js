import React from "react";
import { connect } from "react-redux";

import StreamgraphChart from "../templates/StreamgraphChart";

// importing this for the linter
import d3 from "d3";
import $ from "jquery";

import {
  getLabelPosition,
  moveOverlappingLabels,
  setTM,
  transformData,
} from "../utils/streamgraph";
import {
  CHART_MARGIN,
  MAX_TICKS_X,
  AXIS_PADDING,
  LABEL_BORDER_WIDTH,
  LABEL_ROUND_FACTOR,
  LINE_HELPER_MARGIN,
  TOOLTIP_OFFSET,
} from "../utils/streamgraph";

import { deselectPaper, zoomIn, zoomOut } from "../actions";

/**
 * Class representing the streamgraph visualization.
 *
 * The chart is rendered with React and then d3 is used to
 * render the graph.
 */
class Streamgraph extends React.Component {
  constructor(props) {
    super(props);

    this.stack = d3.layout
      .stack()
      .offset("silhouette")
      .values((d) => d.values)
      .x((d) => d.date)
      .y((d) => d.value);

    this.nest = d3.nest().key((d) => d.key);

    this.labelPositions = [];
  }

  componentDidMount() {
    this.renderGraph();
  }

  componentDidUpdate() {
    this.labelPositions = [];
    this.renderGraph();
  }

  render() {
    const { width, height } = this.props;

    return <StreamgraphChart width={width} height={height} />;
  }

  /**
   * Main d3 rendering function called after each mount and update.
   */
  renderGraph() {
    const { colors } = this.props;
    const { width, height } = this.getDimensions();

    const parsedData = JSON.parse(this.props.data);
    const transformedData = transformData(parsedData);
    const streams = this.getStreams(transformedData);

    const xScale = d3.time.scale().range([0, width]);
    const yScale = d3.scale.linear().range([height, 0]);
    const colorScale = d3.scale.ordinal().range(colors);

    xScale.domain(d3.extent(transformedData, (d) => d.date));
    yScale.domain([0, d3.max(transformedData, (d) => d.y0 + d.y)]);

    const area = d3.svg
      .area()
      .interpolate("cardinal")
      .x((d) => xScale(d.date))
      .y0((d) => yScale(d.y0))
      .y1((d) => yScale(d.y0 + d.y));

    const container = d3.select("#streamgraph-chart");
    container.selectAll("*").remove();

    this.renderBackground(container, width, height);
    this.renderStreams(container, streams, area, colorScale);
    this.renderAxes(container, parsedData, xScale, yScale, width, height);
    this.renderLabels(container, xScale, yScale, width);
    this.renderTooltip(container, xScale);
    this.renderLineHelper(container);
  }

  /**
   * Renders the graph background using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {number} width graph width
   * @param {number} height graph height
   */
  renderBackground(container, width, height) {
    container
      .append("rect")
      .classed("zoom", true)
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("click", this.props.outsideAreaClick)
      .on("mouseover", () => {
        d3.select("#tooltip").classed("hidden", true);
      });
  }

  /**
   * Renders the graph streams using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Array} streams product of this.stack call on the data
   * @param {Object} area the d3 area
   * @param {Function} colorScale d3 ordinal scaling function with colors
   */
  renderStreams(container, streams, area, colorScale) {
    const series = container
      .selectAll(".stream")
      .data(streams)
      .enter()
      .append("g")
      .attr("class", "streamgraph-area")
      .on("click", this.props.onAreaClick);

    series
      .append("path")
      .attr("class", (d) => {
        const { selectedStream } = this.props;
        if (!selectedStream || selectedStream === d.key) {
          return "stream";
        }

        return "stream lower-opacity";
      })
      .attr("d", (d) => area(d.values))
      .style("fill", (d, i) => {
        d.color = colorScale(i);
        return colorScale(i);
      });
  }

  /**
   * Renders the graph axes using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Object} parsedData the parsed JSON containing the streamgraph data
   * @param {Function} xScale x coordinate scaling function
   * @param {Function} yScale y coordinate scaling function
   * @param {number} width graph width
   * @param {number} height graph height
   */
  renderAxes(container, parsedData, xScale, yScale, width, height) {
    const xAxis = d3.svg
      .axis()
      .scale(xScale)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"))
      .ticks(d3.time.year, Math.ceil(parsedData.x.length / MAX_TICKS_X));

    const yAxis = d3.svg
      .axis()
      .scale(yScale)
      .tickFormat(d3.format("d"))
      .tickSubdivide(0);

    if (yScale.domain()[1] <= 8) {
      yAxis.ticks(yScale.domain()[1]);
    }

    container
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    container.append("g").attr("class", "y axis").call(yAxis.orient("left"));

    container
      .append("text")
      .attr("class", "axis-label x")
      .attr("x", width / 2)
      .attr("y", height + AXIS_PADDING.bottom)
      .attr("text-anchor", "middle")
      .text(this.props.localization.stream_year);

    container
      .append("text")
      .attr("class", "axis-label y")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        "translate(" + AXIS_PADDING.left + "," + height / 2 + ")rotate(-90)"
      )
      .text(this.props.localization.stream_doc_num);
  }

  /**
   * Renders the stream labels using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Function} xScale x coordinate scaling function
   * @param {Function} yScale y coordinate scaling function
   * @param {number} width graph width
   */
  renderLabels(container, xScale, yScale, width) {
    const self = this;
    const series = container.selectAll(".streamgraph-area");

    const text = container
      .selectAll("text.label")
      .data(series.data())
      .enter()
      .append("text")
      .attr("dy", "10")
      .classed("label", true)
      .text((d) => {
        if (d.key === "") {
          d.key = "NO_LABEL";
        }
        return d.key;
      })
      .attr("transform", function (d) {
        const position = getLabelPosition(this, d, xScale, yScale, width);
        self.labelPositions.push(position);
        return "translate(" + position.x + ", " + position.y + ")";
      });

    text
      .on("mouseover", (d) => this.handleStreamMouseover(container, d))
      .on("mouseout", () => this.handleStreamMouseout(container))
      .on("mousemove", function (d) {
        self.handleStreamMousemove(container, d3.event, d, xScale);
      });

    text.on("click", (d) => this.props.onAreaClick(d));

    const repositionedLabels = moveOverlappingLabels(this.labelPositions);

    container.selectAll("text.label").attr("transform", (d) => {
      const currentLabel = repositionedLabels.find((obj) => {
        return obj.key === d.key;
      });
      return "translate(" + currentLabel.x + "," + currentLabel.y + ")";
    });

    const labels = container.selectAll(".label");
    labels[0].forEach((label) => {
      const bbox = label.getBBox();
      const ctm = label.getCTM();

      const rect = container
        .insert("rect", "text.label")
        .classed("label-background", true)
        .attr("x", bbox.x - CHART_MARGIN.left - LABEL_BORDER_WIDTH)
        .attr("y", bbox.y - CHART_MARGIN.top - LABEL_BORDER_WIDTH)
        .attr("width", bbox.width + LABEL_BORDER_WIDTH * 2)
        .attr("height", bbox.height + LABEL_BORDER_WIDTH * 2)
        .attr("rx", LABEL_ROUND_FACTOR);

      const currentData = label.__data__;

      rect
        .on("mouseover", () =>
          this.handleStreamMouseover(container, currentData)
        )
        .on("mouseout", () => this.handleStreamMouseout(container))
        .on("mousemove", function (d) {
          self.handleStreamMousemove(container, d3.event, currentData, xScale);
        });

      rect.on("click", () => {
        const currentStream = container.selectAll(".stream").filter((el) => {
          return el.key === currentData.key;
        });

        let color = currentStream.style("fill");
        this.props.onAreaClick({ key: currentData.key, color });
      });

      setTM(rect[0][0], ctm);
    });
  }

  /**
   * Renders the stream tooltip using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Function} xScale x coordinate scaling function
   */
  renderTooltip(container, xScale) {
    let self = this;

    const previousTooltip = d3.select("#tooltip");
    if (previousTooltip.empty() || previousTooltip.classed("hidden")) {
      previousTooltip.remove();

      d3.select("#" + this.props.visTag)
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tip hidden")
        .style("top", $("#headstart-chart").offset().top + "px");
    }

    container
      .selectAll(".stream")
      .on("mouseover", (d) => this.handleStreamMouseover(container, d))
      .on("mouseout", () => this.handleStreamMouseout(container))
      .on("mousemove", function (d) {
        self.handleStreamMousemove(container, d3.event, d, xScale);
      });
  }

  /**
   * Renders the chart vertical line using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   */
  renderLineHelper(container) {
    const { height } = this.props;

    d3.select(".line_helper").remove();

    const lineHelper = d3
      .select("#headstart-chart")
      .append("div")
      .attr("class", "line_helper")
      .style("height", height);

    const moveLine = function (event) {
      lineHelper.style("left", event.clientX + LINE_HELPER_MARGIN + "px");
    };

    container
      .on("mousemove", function () {
        moveLine(d3.event);
      })
      .on("mouseover", function () {
        moveLine(d3.event);
      });
  }

  /**
   * Highlights the currently hovered stream using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Object} el the d3 representation of the currently hovered stream
   */
  handleStreamMouseover(container, el) {
    if (typeof el === "undefined") {
      return;
    }

    container
      .selectAll(".stream")
      .transition()
      .duration(100)
      .attr("class", (d) => {
        const { selectedStream } = this.props;
        if (d.key === el.key || selectedStream === d.key) {
          return "stream";
        }
        return "stream lower-opacity";
      });
  }

  /**
   * Unhighlights the currently hovered stream using d3.
   *
   * @param {*} container the d3 representation of #streamgraph-chart
   */
  handleStreamMouseout(container) {
    d3.select("#tooltip").classed("hidden", true);

    if (this.props.selectedStream === null) {
      container
        .selectAll(".stream")
        .transition()
        .duration(100)
        .attr("class", "stream");
      return;
    }

    container
      .selectAll(".stream")
      .transition()
      .duration(100)
      .attr("class", (d) => {
        if (this.props.selectedStream !== d.key) {
          return "stream lower-opacity";
        }
        return "stream";
      });
  }

  /**
   * Displays the stream tooltip using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Object} event the d3 event that triggered the call of this function
   * @param {Object} d the d3 element where the event was triggered
   * @param {Function} xScale x coordinate scaling function
   */
  handleStreamMousemove(container, event, d, xScale) {
    if (typeof d === "undefined") {
      return;
    }

    let realX = event.clientX;
    let realY = event.clientY;
    let invertedX = xScale.invert(
      realX - $("#streamgraph_subject").offset().left - CHART_MARGIN.left
    );
    let xDate = invertedX.getFullYear();
    const currentStream = container
      .selectAll(".stream")
      .filter((el) => el.key === d.key);

    const color = currentStream.style("fill");
    const currentData = currentStream.data()[0];

    const allYearsDocs = d3.sum(d.values, (currentData) => currentData.value);
    currentData.values.forEach((f) => {
      const year = f.date.toString().split(" ")[3];
      if (xDate === parseInt(year)) {
        d3.select("#tooltip")
          .style("left", realX + TOOLTIP_OFFSET.left + "px")
          .style("top", realY + TOOLTIP_OFFSET.top + "px")
          .html(() =>
            getTooltip(
              {
                year,
                color,
                keyword: f.key,
                currentYearDocs: f.value,
                allYearsDocs,
              },
              this.props.localization
            )
          )
          .classed("hidden", false);
      }
    });
  }

  getDimensions() {
    const width = this.props.width - CHART_MARGIN.left - CHART_MARGIN.right;
    const height = this.props.height - CHART_MARGIN.top - CHART_MARGIN.bottom;

    return { width, height };
  }

  getStreams(transformedData) {
    const nestedEntries = this.nest.entries(transformedData);
    const streams = this.stack(nestedEntries);

    return streams;
  }
}

const mapStateToProps = (state) => ({
  data: state.streamgraph.data,
  colors: state.streamgraph.colors,
  width: state.chart.streamWidth,
  height: state.chart.streamHeight,
  selectedStream: state.selectedBubble ? state.selectedBubble.title : null,
  visTag: state.streamgraph.visTag,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onAreaClick: (area) => {
    dispatch(deselectPaper());
    dispatch(zoomIn({ title: area.key, color: area.color }));
  },
  outsideAreaClick: () => dispatch(zoomOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Streamgraph);

const getTooltip = (
  { year, color, keyword, currentYearDocs, allYearsDocs },
  localization
) => {
  return `<div style="font-family: Lato; font-size:10px;">
<div class='year'>${year}</div>
<div class='key' style="text-transform: none; font-size:14px; margin-bottom: 5px;">
    <span
        style='background:${color}; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; width:15px; height: 10px;'
        class='swatch'>&nbsp;</span>
    ${keyword}
</div>
<div class='value'> ${localization.stream_docs}: ${currentYearDocs} </div>
<div class='value'> ${localization.stream_total}: ${allYearsDocs} </div>
</div>`;
};
