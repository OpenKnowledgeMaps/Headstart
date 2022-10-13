import React from "react";
import { connect } from "react-redux";

import StreamgraphChart from "../templates/StreamgraphChart";

// importing this for the linter
import d3 from "d3";
import $ from "jquery";

import {
  getLabelPosition,
  recalculateOverlappingLabels,
  setTM,
} from "../utils/streamgraph";
import {
  CHART_MARGIN,
  COLOR_RECT_MARGIN_RIGHT,
  COLOR_RECT_WIDTH,
  MAX_TICKS_X,
  AXIS_PADDING,
  LABEL_BORDER_WIDTH,
  LABEL_ROUND_FACTOR,
  LINE_HELPER_MARGIN,
  TOOLTIP_OFFSET,
} from "../utils/streamgraph";

import { zoomIn, zoomOut } from "../actions";

/**
 * Class representing the streamgraph visualization.
 *
 * The chart is rendered with React and then d3 is used to
 * render the graph.
 */
class Streamgraph extends React.Component {
  constructor(props) {
    super(props);

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

    const xScale = d3.time.scale().range([0, width]);
    const yScale = d3.scale.linear().range([height, 0]);
    const colorScale = d3.scale.ordinal().range(colors);

    const streams = this.props.streams;
    const streamEntries = streams.reduce(
      (l, stream) => [...l, ...stream.values],
      []
    );

    xScale.domain(d3.extent(streamEntries, (d) => d.date));
    yScale.domain([0, d3.max(streamEntries, (d) => d.y0 + d.y)]);

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
    this.renderAxes(container, streams, xScale, yScale, width, height);
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
   * @param {Object} streams the stream array
   * @param {Function} xScale x coordinate scaling function
   * @param {Function} yScale y coordinate scaling function
   * @param {number} width graph width
   * @param {number} height graph height
   */
  renderAxes(container, streams, xScale, yScale, width, height) {
    const xAxis = d3.svg
      .axis()
      .scale(xScale)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"))
      .ticks(d3.time.year, Math.ceil(streams.length / MAX_TICKS_X));

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
    // first render the texts and colors
    this.renderLabelsContent(container, xScale, yScale, width);

    // then move them if they overlap
    this.moveOverlappingLabels(container);

    // finally render the white boxes
    this.renderLabelsBoxes(container, xScale);
  }

  /**
   * Renders the stream labels content (rectangle in the stream color + stream name) using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Function} xScale x coordinate scaling function
   * @param {Function} yScale y coordinate scaling function
   * @param {number} width graph width
   */
  renderLabelsContent(container, xScale, yScale, width) {
    const self = this;
    const series = container.selectAll(".streamgraph-area");

    const labels = container
      .selectAll("g.label")
      .data(series.data())
      .enter()
      .append("g")
      .attr("dy", "10")
      .classed("label", true);

    labels
      .append("rect")
      .style("fill", (d) => d.color)
      .style("fill-opacity", "1")
      .attr("x", 0)
      .attr("y", -8)
      .attr("width", COLOR_RECT_WIDTH)
      .attr("height", 8)
      .attr("rx", LABEL_ROUND_FACTOR);

    labels
      .append("text")
      .attr("dx", COLOR_RECT_WIDTH + COLOR_RECT_MARGIN_RIGHT)
      .text((d) => {
        if (d.key === "") {
          d.key = "NO_LABEL";
        }
        return d.key;
      });

    labels.attr("transform", function (d) {
      const position = getLabelPosition(this, d, xScale, yScale, width);
      self.labelPositions.push(position);
      return "translate(" + position.x + ", " + position.y + ")";
    });

    labels
      .on("mouseover", (label) => this.handleStreamMouseover(container, label))
      .on("mouseout", () => this.handleStreamMouseout(container))
      .on("mousemove", (label) =>
        this.handleStreamMousemove(d3.event, label, xScale)
      );

    labels.on("click", (d) => this.props.onAreaClick(d));
  }

  /**
   * Renders the stream labels boxes and borders using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Function} xScale x coordinate scaling function
   */
  renderLabelsBoxes(container, xScale) {
    const labels = container.selectAll(".label");
    labels[0].forEach((label) => {
      const bbox = label.getBBox();
      const ctm = label.getCTM();

      const boxes = container
        .insert("rect", "g.label")
        .classed("label-background", true)
        .attr("x", bbox.x - CHART_MARGIN.left - LABEL_BORDER_WIDTH)
        .attr("y", bbox.y - CHART_MARGIN.top - LABEL_BORDER_WIDTH)
        .attr("width", bbox.width + LABEL_BORDER_WIDTH * 2)
        .attr("height", bbox.height + LABEL_BORDER_WIDTH * 2)
        .attr("rx", LABEL_ROUND_FACTOR);

      const currentData = label.__data__;

      boxes
        .on("mouseover", () =>
          this.handleStreamMouseover(container, currentData)
        )
        .on("mouseout", () => this.handleStreamMouseout(container))
        .on("mousemove", (d) =>
          this.handleStreamMousemove(d3.event, currentData, xScale)
        );

      boxes.on("click", () => this.props.onAreaClick(currentData));

      setTM(boxes[0][0], ctm);
    });
  }

  /**
   * Moves the already rendered labels so they do not collide.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   */
  moveOverlappingLabels(container) {
    const repositionedLabels = recalculateOverlappingLabels(
      this.labelPositions
    );

    container.selectAll("g.label").attr("transform", (d) => {
      const currentLabel = repositionedLabels.find((obj) => {
        return obj.key === d.key;
      });
      return "translate(" + currentLabel.x + "," + currentLabel.y + ")";
    });
  }

  /**
   * Renders the stream tooltip using d3.
   *
   * @param {Object} container the d3 representation of #streamgraph-chart
   * @param {Function} xScale x coordinate scaling function
   */
  renderTooltip(container, xScale) {
    const previousTooltip = d3.select("#tooltip");
    if (previousTooltip.empty() || previousTooltip.classed("hidden")) {
      previousTooltip.remove();

      d3.select("#" + this.props.visTag)
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tip hidden");
    }

    container
      .selectAll(".stream")
      .on("mouseover", (s) => this.handleStreamMouseover(container, s))
      .on("mouseout", () => this.handleStreamMouseout(container))
      .on("mousemove", (s) => this.handleStreamMousemove(d3.event, s, xScale));
  }

  /**
   * Mouse x, y relative to the whole document.
   * @param {Object} event
   * @returns {x,y} mouse coords
   */
  getAbsoluteMouseCoords(event) {
    return {
      x: event.pageX,
      y: event.pageY,
    };
  }

  /**
   * Mouse x, y relative to the streamgraph chart.
   * @param {Object} event
   * @returns {x,y} mouse coords
   */
  getRelativeMouseCoords(event) {
    const { x, y } = this.getAbsoluteMouseCoords(event);

    const sgOffset = $("#streamgraph_subject").offset();

    return {
      x: x - sgOffset.left,
      y: y - sgOffset.top,
    };
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

    const moveLine = (event) => {
      const { x } = this.getRelativeMouseCoords(event);
      lineHelper.style("left", x + LINE_HELPER_MARGIN + "px");
    };

    container
      .on("mousemove", () => moveLine(d3.event))
      .on("mouseover", () => moveLine(d3.event));
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
   * @param {Object} event the d3 event that triggered the call of this function
   * @param {Object} element the d3 element where the event was triggered
   * @param {Function} xScale x coordinate scaling function
   */
  handleStreamMousemove(event, element, xScale) {
    if (typeof element === "undefined") {
      return;
    }

    const { x } = this.getRelativeMouseCoords(event);
    const { y } = this.getAbsoluteMouseCoords(event);

    const invertedX = xScale.invert(x - CHART_MARGIN.left);
    const streamYear = invertedX.getFullYear();

    const totalDocs = element.values
      .map((v) => v.value)
      .reduce((a, b) => a + b, 0);

    const currentYearData = element.values.find(
      (v) => streamYear === v.date.getFullYear()
    );

    if (currentYearData) {
      const tooltipEl = d3.select("#tooltip");
      tooltipEl
        .html(() =>
          getTooltip(
            {
              year: streamYear,
              color: element.color,
              keyword: currentYearData.key,
              yearDocs: currentYearData.value,
              totalDocs,
            },
            this.props.localization
          )
        )
        .classed("hidden", false);

      const tooltipHeight = tooltipEl.node().getBoundingClientRect().height;
      const tooltipY = Math.max(
        window.scrollY,
        y - tooltipHeight + TOOLTIP_OFFSET.top
      );
      tooltipEl
        .style("top", tooltipY + "px")
        .style("left", x + TOOLTIP_OFFSET.left + "px");
    }
  }

  getDimensions() {
    const width = this.props.width - CHART_MARGIN.left - CHART_MARGIN.right;
    const height = this.props.height - CHART_MARGIN.top - CHART_MARGIN.bottom;

    return { width, height };
  }
}

const mapStateToProps = (state) => ({
  streams: state.streamgraph.streams,
  colors: state.streamgraph.colors,
  width: state.chart.streamWidth,
  height: state.chart.streamHeight,
  selectedStream: state.selectedBubble ? state.selectedBubble.title : null,
  visTag: state.streamgraph.visTag,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onAreaClick: (stream) => {
    dispatch(
      zoomIn({ title: stream.key, color: stream.color, docIds: stream.docIds })
    );
  },
  outsideAreaClick: () => dispatch(zoomOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Streamgraph);

const getTooltip = (
  { year, color, keyword, yearDocs, totalDocs },
  localization
) => {
  return `
<div class="sg-tooltip">
  <div class="year">${year}</div>
  <div class="key">
    <span
      style="background:${color}; width:15px; height: 10px;"
      class="swatch"
    >
      &nbsp;
    </span>
    ${keyword}
  </div>
  <div class="value">
    ${localization.stream_docs} ${year}: ${yearDocs}
  </div>
  <div class="value">
    ${localization.stream_total}: ${totalDocs}
  </div>
</div>
`.trim();
};
