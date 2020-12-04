import React from "react";
import Highlight from "../components/Highlight";

import Paper from "./Paper";

const SQRT_2 = Math.sqrt(2);
class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.getCoordinates = this.getCoordinates.bind(this);
    this.changePaperOrder = this.changePaperOrder.bind(this);
    this.getSortedPapers = this.getSortedPapers.bind(this);
    this.renderPaper = this.renderPaper.bind(this);

    const { x, y, r } = this.getCoordinates();
    this.state = { x, y, r, paperOrder: [] };
    this.circleRef = React.createRef();
  }

  componentDidUpdate() {
    const { x, y, r } = this.state;
    const { x: newX, y: newY, r: newR } = this.getCoordinates();
    if (x === newX && y === newY && r === newR ) {
      return;
    }

    this.setState({
      ...this.state,
      x: newX,
      y: newY,
      r: newR,
    });
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
            {!hovered && !zoom && (
              <div id="area_title" style={areaTitleStyle}>
                <p id="area_visual_distributions"></p>
                <h2 style={{ fontSize: 14 }}>
                  <Highlight>{title}</Highlight>
                </h2>
              </div>
            )}
          </div>
        </foreignObject>
        {(hovered || zoomed) && sortedPapers.map(this.renderPaper)}
      </g>
      // html template ends here
    );
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
    const { zoom, selectedPaperId, baseUnit, handleSelectPaper } = this.props;

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
        onClick={handlePaperClick}
        onMouseOver={handlePaperMouseOver}
      />
    );
  }
}

export default Bubble;
