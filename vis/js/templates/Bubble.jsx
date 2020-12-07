import React from "react";
import Highlight from "../components/Highlight";

import { select } from "d3-selection";

import Paper from "./Paper";

const SQRT_2 = Math.sqrt(2);
class Bubble extends React.Component {
  constructor(props) {
    super(props);
    // TODO rewrite this using https://www.npmjs.com/package/core-decorators#autobind ?
    this.getCoordinates = this.getCoordinates.bind(this);
    this.changePaperOrder = this.changePaperOrder.bind(this);
    this.getSortedPapers = this.getSortedPapers.bind(this);
    this.renderPaper = this.renderPaper.bind(this);
    this.isAnimated = this.isAnimated.bind(this);
    this.isInMotion = this.isInMotion.bind(this);

    const { x, y, r } = this.getCoordinates();
    this.state = { x, y, r, paperOrder: [] };
    this.circleRef = React.createRef();

    this.isAnimatedOnMount = this.isAnimated();
  }

  componentDidMount() {
    if (this.isAnimatedOnMount) {
      this.animate();
    }
  }

  componentDidUpdate() {
    const { x, y, r } = this.state;
    const { x: newX, y: newY, r: newR } = this.getCoordinates();
    if (x === newX && y === newY && r === newR) {
      return;
    }

    if (this.isAnimated()) {
      this.animate();
    } else {
      this.setState({
        ...this.state,
        x: newX,
        y: newY,
        r: newR,
      });
    }
  }

  componentWillUnmount() {
    const el = select(this.circleRef.current);
    el.interrupt();
  }

  render() {
    const { eventHandlers, papers, hovered, zoomed, zoom } = this.props;

    const sortedPapers = this.getSortedPapers();

    const { title } = this.props.data;
    const { x, y, r } = this.state;

    const width = (2 * r) / SQRT_2;
    const height = width;

    // TODO framed bubble on area title hover
    // TODO move the inline styles into css
    const areaTitleStyle = {
      wordWrap: "break-word",
      fontSize: "12px",
      width,
      height,
    };

    const circleStyle = { fillOpacity: 0.9 };
    let circleClass = "";
    if (zoomed) {
      circleClass = " zoom_selected";
    }
    if (hovered || zoomed) {
      circleStyle.fillOpacity = 1;
    }
    if (zoom && !zoomed) {
      circleStyle.fillOpacity = 0.1;
      circleClass = " zoom_unselected";
    }
    if (hovered || zoom || this.isInMotion()) {
      areaTitleStyle.display = "none";
    }

    return (
      // html template starts here
      <g className="bubble_frame" {...eventHandlers}>
        {!hovered && !zoomed && papers.map(this.renderPaper)}
        <circle
          className={"area" + circleClass}
          r={r}
          cx={x}
          cy={y}
          style={circleStyle}
          ref={this.circleRef}
        >
          <title>{title}</title>
        </circle>
        <foreignObject
          id="area_title_object"
          className="headstart"
          x={x - r / SQRT_2}
          y={y - r / SQRT_2}
          width={width}
          height={height}
          style={{ cursor: !zoomed ? "zoom-in" : undefined }}
        >
          <div>
            <div id="area_title" style={areaTitleStyle}>
              <p id="area_visual_distributions"></p>
              <h2 style={{ fontSize: 14 }}>
                <Highlight>{title}</Highlight>
              </h2>
            </div>
          </div>
        </foreignObject>
        {(hovered || zoomed) && sortedPapers.map(this.renderPaper)}
      </g>
      // html template ends here
    );
  }

  isAnimated() {
    return this.props.animation !== null;
  }

  isInMotion() {
    const { x, y, r } = this.state;
    const { x: realX, y: realY, r: realR } = this.getCoordinates();
    return x !== realX || y !== realY || r !== realR;
  }

  animate() {
    const el = select(this.circleRef.current);
    const { x, y, r } = this.getCoordinates();

    el.transition(this.props.animation.transition)
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", r)
      .on("end", () => {
        this.setState({
          ...this.state,
          x,
          y,
          r,
        });
      });
  }

  getCoordinates() {
    const { x, y, r, zoomedX, zoomedY, zoomedR } = this.props.data;
    if (this.props.zoom) {
      return { x: zoomedX, y: zoomedY, r: zoomedR };
    }

    return { x, y, r };
  }

  changePaperOrder(paperId) {
    const newPaperOrder = this.state.paperOrder.filter((id) => id !== paperId);
    newPaperOrder.push(paperId);
    this.setState({ ...this.state, paperOrder: newPaperOrder });
  }

  getSortedPapers() {
    const newArray = [...this.props.papers];
    this.state.paperOrder.forEach((id) => {
      const index = newArray.findIndex((e) => e.safe_id === id);
      newArray.push(newArray[index]);
      newArray.splice(index, 1);
    });

    return newArray;
  }

  renderPaper(paper) {
    const { zoom, selectedPaperId, baseUnit, animation } = this.props;
    const { handleSelectPaper } = this.props;

    const handlePaperClick = (event) => {
      // this is necessary so the paper is not deselected immediately with the
      // bubble click event
      event.stopPropagation();
      handleSelectPaper(paper);
    };

    const handlePaperMouseOver = () => {
      this.changePaperOrder(paper.safe_id);
    };

    return (
      <Paper
        key={paper.safe_id}
        data={paper}
        readersLabel={baseUnit}
        zoom={zoom}
        selected={selectedPaperId === paper.safe_id}
        onClick={this.isAnimated() ? undefined : handlePaperClick}
        onMouseOver={this.isAnimated() ? undefined : handlePaperMouseOver}
        animation={animation}
      />
    );
  }
}

export default Bubble;
