// @ts-nocheck

import React from "react";
import BubbleTitle from "./BubbleTitle";

import { select } from "d3-selection";

const SQRT_2 = Math.sqrt(2);
class Bubble extends React.Component {
  constructor(props) {
    super(props);
    // TODO rewrite this using https://www.npmjs.com/package/core-decorators#autobind ?
    this.getCoordinates = this.getCoordinates.bind(this);
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
    if (el.interrupt) {
      el.interrupt();
    }
  }

  render() {
    const { eventHandlers, zoom } = this.props;
    const { hovered, zoomed, highlighted } = this.props;

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
    let displayArea = true;
    if (hovered || zoom || this.isInMotion()) {
      displayArea = false;
    }
    if (highlighted) {
      circleClass += " highlight-bubble";
    }

    return (
      // html template starts here
      <g className="bubble_frame" {...eventHandlers}>
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
        {!!displayArea && (
          <foreignObject
            id="area_title_object"
            className="headstart"
            x={x - width / 2}
            y={y - height / 2}
            width={width}
            height={height}
            style={{ cursor: !zoomed ? "zoom-in" : undefined }}
          >
            <div>
              <div id="area_title" style={areaTitleStyle}>
                <p id="area_visual_distributions"></p>
                <BubbleTitle height={height}>{title}</BubbleTitle>
              </div>
            </div>
          </foreignObject>
        )}
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
}

export default Bubble;
