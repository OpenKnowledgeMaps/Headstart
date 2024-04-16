import React from "react";
import Highlight from "../components/Highlight";
import Hyphenate from "../components/Hyphenate";

import { select } from "d3-selection";
import { formatPaperDate } from "./listentry/Title";
import Icons from "./paper/Icons";

class Paper extends React.Component {
  constructor(props) {
    super(props);
    // TODO rewrite this using https://www.npmjs.com/package/core-decorators#autobind ?
    this.getCoordinatesAndDimensions =
      this.getCoordinatesAndDimensions.bind(this);
    this.isAnimated = this.isAnimated.bind(this);
    this.animate = this.animate.bind(this);
    this.animatePath = this.animatePath.bind(this);
    this.animateDogEar = this.animateDogEar.bind(this);
    this.animatePaper = this.animatePaper.bind(this);
    this.isZoomingIn = this.isZoomingIn.bind(this);
    this.isZoomingOut = this.isZoomingOut.bind(this);
    this.hasRoundedDesign = this.hasRoundedDesign.bind(this);
    this.getPath = this.getPath.bind(this);

    this.isAnimatedOnMount = this.isAnimated();

    const { x, y, width, height } = this.getCoordinatesAndDimensions(
      this.isAnimatedOnMount
    );
    const path = this.getPath({ x, y, width, height });
    const dogEar = getDogEar({ x, y, width, height });
    this.state = { x, y, width, height, path, dogEar };

    this.pathRef = React.createRef();
    this.dogearRef = React.createRef();
    this.paperRef = React.createRef();
    this.metadataRef = React.createRef();
  }

  componentDidMount() {
    if (this.isAnimatedOnMount) {
      this.animate();
    }
  }

  componentDidUpdate() {
    const { x, y, width, height } = this.state;
    const {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    } = this.getCoordinatesAndDimensions();
    if (
      x === newX &&
      y === newY &&
      width === newWidth &&
      height === newHeight
    ) {
      return;
    }

    if (this.isAnimated()) {
      this.animate();
    } else {
      const newCoords = {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
      const path = this.getPath(newCoords);
      const dogEar = getDogEar(newCoords);

      this.setState({ ...this.state, ...newCoords, path, dogEar });
    }
  }

  componentWillUnmount() {
    const pathEl = select(this.pathRef.current);
    if (pathEl.interrupt) {
      pathEl.interrupt();
    }

    if (!this.hasRoundedDesign()) {
      const dogearEl = select(this.dogearRef.current);
      if (dogearEl.interrupt) {
        dogearEl.interrupt();
      }
    }

    const paperEl = select(this.paperRef.current);
    if (paperEl.interrupt) {
      paperEl.interrupt();
    }
  }

  render() {
    const { data, readersLabel, zoom, selected, hovered } = this.props;
    const { maxSize, enlargeFactor } = this.props;
    const { onClick, onMouseOver, onMouseOut } = this.props;

    const {title, authors_string: authors, authors_list: authors_list, year, area} = data;
    const { num_readers: readers, published_in: publisher } = data;
    const { x, y, width: baseWidth, height: baseHeight } = this.state;
    const { path: basePath, dogEar: baseDogEar } = this.state;

    let { width: realWidth, height: realHeight } =
      this.getCoordinatesAndDimensions();

    const handleMouseOver = () => {
      let newEnlargeFactor = null;
      if (!hovered) {
        newEnlargeFactor = getEnlargeFactor(
          this.metadataRef.current.offsetWidth,
          this.metadataRef.current.scrollHeight
        );
      }
      onMouseOver(newEnlargeFactor);
    };

    const handleMouseOut = () => {
      onMouseOut();
    };

    // TODO move helper functions inside the class

    let width = baseWidth;
    let height = baseHeight;
    let path = basePath;
    let dogEar = baseDogEar;
    if (hovered) {
      let realEnlargeFactor = enlargeFactor;
      if (height * realEnlargeFactor > maxSize) {
        realEnlargeFactor = maxSize / height;
      }

      width *= realEnlargeFactor;
      height *= realEnlargeFactor;

      path = this.getPath({ x, y, width, height });
      dogEar = getDogEar({ x, y, width, height });
      realWidth = width;
      realHeight = height;
    }

    let gClass = "paper";
    let pathClass = "paper_path" + (selected ? " framed" : " unframed");
    let paperClass = "paper_holder";
    let sizeModifierClass = "";
    if (zoom || this.isZoomingIn()) {
      pathClass += " zoomed_in";
      paperClass += " zoomed_in";
      sizeModifierClass = "large";
    }
    if (hovered) {
      sizeModifierClass = "larger";
    }
    if (this.hasRoundedDesign()) {
      gClass += " resulttype-dataset";
    }

    // TODO move everything into styles

    const eventHandlers = { onClick: onClick };
    if (zoom) {
      eventHandlers.onMouseOver = handleMouseOver;
      eventHandlers.onMouseOut = handleMouseOut;
    }


    // function returns a string of authors with conditionals if the list is too long, it's cut off and an ellipsis is added
    // if less than maxLength authors, the full list is returned
    function cutAuthors(authorsList, maxLength) {
      if (authorsList.length > maxLength) {
        const firstAuthors = authorsList.slice(0, maxLength - 1).join(', ');
        const lastAuthor = authorsList[authorsList.length - 1];
        return `${firstAuthors}, ... ${lastAuthor}`;
      } else {
        return authors
      }
    }

    return (
      // html template starts here
      <g className={gClass} {...eventHandlers}>
        {!zoom && <title>{area}</title>}
        {!this.isZoomingOut() && (
          <path
            id="region"
            d={path}
            className={pathClass}
            style={{ fillOpacity: 1 }}
            ref={this.pathRef}
          ></path>
        )}
        {!this.hasRoundedDesign() && !this.isZoomingOut() && (
          <path
            className="paper_path dogear"
            d={dogEar}
            ref={this.dogearRef}
          ></path>
        )}
        <foreignObject
          id="article_metadata"
          x={x}
          y={y}
          width={width}
          height={height}
          ref={this.paperRef}
        >
          <div style={{ width: realWidth, height: realHeight }}>
            <div className={paperClass}>
              <div
                className="metadata"
                style={{
                  height: getMetadataHeight(realHeight, !!readersLabel, zoom),
                  width: (1 - DOGEAR_WIDTH) * realWidth,
                }}
                ref={this.metadataRef}
              >
                <Icons paper={data} iconClasses={sizeModifierClass} />
                <p className={"title " + sizeModifierClass}>
                  <Hyphenate>
                    <Highlight hyphenated queryHighlight>
                      {title}
                    </Highlight>{" "}
                    {!!year && (
                      <Highlight queryHighlight>
                        {`(${formatPaperDate(year)})`}
                      </Highlight>
                    )}
                  </Hyphenate>
                </p>
                <p id="details" className={sizeModifierClass}>
                  <Hyphenate>
                    <Highlight hyphenated queryHighlight>
                      {/*{authors}*/}
                      {cutAuthors(authors_list, 15)}
                    </Highlight>
                  </Hyphenate>
                </p>
                <p id="in" className={sizeModifierClass}>
                  {publisher && (
                    <>
                      in{" "}
                      <Hyphenate>
                        <Highlight hyphenated queryHighlight>
                          {publisher}
                        </Highlight>
                      </Hyphenate>
                    </>
                  )}
                </p>
              </div>
              {!!readersLabel &&
                typeof readers !== "undefined" &&
                readers !== null && (
                  <div className="readers">
                    <p id="readers" className={sizeModifierClass}>
                      <span id="num-readers">{readers} </span>
                      <span className="readers_entity">{readersLabel}</span>
                    </p>
                  </div>
                )}
            </div>
          </div>
        </foreignObject>
      </g>
      // html template ends here
    );
  }

  isAnimated() {
    return this.props.animation !== null;
  }

  animate() {
    this.animatePath();
    if (!this.hasRoundedDesign()) {
      this.animateDogEar();
    }
    this.animatePaper();
  }

  animatePath() {
    const { x, y, width, height } = this.getCoordinatesAndDimensions();
    const el = select(this.pathRef.current);

    const path = this.getPath({ x, y, width, height });

    el.transition(this.props.animation.transition)
      .attr("d", path)
      .on("end", () => this.setState({ ...this.state, path: path }));
  }

  animateDogEar() {
    const { x, y, width, height } = this.getCoordinatesAndDimensions();
    const el = select(this.dogearRef.current);

    const dogEar = getDogEar({ x, y, width, height });

    el.transition(this.props.animation.transition)
      .attr("d", dogEar)
      .on("end", () => {
        this.setState({ ...this.state, dogEar });
      });
  }

  animatePaper() {
    let { x, y, width, height } = this.getCoordinatesAndDimensions();
    const el = select(this.paperRef.current);

    el.transition(this.props.animation.transition)
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .on("end", () => {
        const { hovered, enlargeFactor, maxSize } = this.props;
        if (hovered) {
          let realEnlargeFactor = enlargeFactor;
          if (height * realEnlargeFactor > maxSize) {
            realEnlargeFactor = maxSize / height;
          }

          width *= realEnlargeFactor;
          height *= realEnlargeFactor;
        }

        this.setState({
          ...this.state,
          x,
          y,
          width,
          height,
        });
      });
  }

  getCoordinatesAndDimensions(previous = false) {
    const { data, zoom, animation } = this.props;
    if (previous && animation && animation.alreadyZoomed) {
      const {
        prevZoomedX: x,
        prevZoomedY: y,
        prevZoomedWidth: width,
        prevZoomedHeight: height,
      } = data;

      return { x, y, width, height };
    }

    let returnZoomedCoords = zoom;
    if (previous) {
      returnZoomedCoords = this.isZoomingOut();
    }

    const { x, y, width, height } = data;
    const { zoomedX, zoomedY, zoomedWidth, zoomedHeight } = data;

    if (returnZoomedCoords) {
      return {
        x: zoomedX,
        y: zoomedY,
        width: zoomedWidth,
        height: zoomedHeight,
      };
    }

    return { x, y, width, height };
  }

  isZoomingIn() {
    const { animation } = this.props;
    return !!animation && animation.type === "ZOOM_IN";
  }

  isZoomingOut() {
    const { animation } = this.props;
    return !!animation && animation.type === "ZOOM_OUT";
  }

  hasRoundedDesign() {
    return isNonTextDocument(this.props.data);
  }

  getPath = ({ x, y, width, height }) => {
    if (this.hasRoundedDesign()) {
      return getRoundedPath({ x, y, width, height });
    }
    return getSquarePath({ x, y, width, height });
  };
}

export default Paper;

// config.dogear_width
const DOGEAR_WIDTH = 0.15;
// config.dogear_height
const DOGEAR_HEIGHT = 0.15;

const getDogEar = ({ x, y, width: w, height: h }) => {
  return `M ${x + (1 - DOGEAR_WIDTH) * w} ${y} v ${DOGEAR_HEIGHT * h} h ${
    DOGEAR_WIDTH * w
  }`;
};

const getRoundedPath = ({ x, y, width, height }) => {
  const r = 10;
  const lineWidth = width - 2 * r;
  const lineHeight = height - 2 * r;

  return `M ${x} ${y + r} \
  v ${lineHeight} \
  a ${r} ${r} 0 0 0 ${r} ${r} \
  h ${lineWidth} \
  a ${r} ${r} 1 0 0 ${r} ${-r} \
  v ${-lineHeight} \
  a ${r} ${r} 0 0 0 ${-r} ${-r} \
  h ${-lineWidth} \
  a ${r} ${r} 0 0 0 ${-r} ${r} Z`;
};

const getSquarePath = ({ x, y, width: w, height: h }) => {
  return `M ${x} ${y} h ${(1 - DOGEAR_WIDTH) * w} l ${DOGEAR_HEIGHT * w} ${
    DOGEAR_WIDTH * h
  } v ${(1 - DOGEAR_HEIGHT) * h} h ${-w} v ${-h}`;
};

const getEnlargeFactor = (offsetWidth, scrollHeight) => {
  // config.paper_width_factor
  const PAPER_WIDTH_FACTOR = 1.2;
  // config.paper_height_factor
  const PAPER_HEIGHT_FACTOR = 1.6;
  const oldRatio = PAPER_WIDTH_FACTOR / PAPER_HEIGHT_FACTOR;
  let newWidth = offsetWidth;
  let newRatio = scrollHeight / newWidth;

  while (newRatio.toFixed(1) > oldRatio.toFixed(1)) {
    scrollHeight -= Math.pow(PAPER_HEIGHT_FACTOR, 3);
    newWidth += Math.pow(PAPER_WIDTH_FACTOR, 3);
    newRatio = scrollHeight / newWidth;
  }

  return (newWidth / offsetWidth) * (1.0 / (1 - DOGEAR_WIDTH));
};

const getMetadataHeight = (realHeight, hasReaders, isZoomed) => {
  let readersHeight = 0;
  if (hasReaders) {
    if (isZoomed) {
      readersHeight = 22;
    } else {
      readersHeight = 12;
    }
  }

  const height = realHeight - readersHeight;

  if (height >= 20) {
    return height;
  }

  return 20;
};

const isNonTextDocType = (t) =>
  [
    "dataset",
    "musical notation",
    "map",
    "audio",
    "image/video",
    "still image",
    "moving image/video",
    "software",
  ].includes(t.toLowerCase());

const UNKNOWN_TYPE = "other/unknown material";

export const isNonTextDocument = (paper) => {
  // the following complex logic was required by Maxi:
  // https://docs.google.com/document/d/11ybT41oceMA29tplmBsyXxqswio-WFdpebcR7qhWoH0/edit#heading=h.y9ftuuxdxyx0

  const hasUnknown = paper.resulttype.some(
    (t) => t.toLowerCase() === UNKNOWN_TYPE
  );

  if (!hasUnknown) {
    return paper.resulttype.some(isNonTextDocType);
  }

  const knownTypes = paper.resulttype.filter((t) => t.toLowerCase() !== UNKNOWN_TYPE);

  // the only type is unknown
  if (knownTypes.length === 0) {
    return true;
  }

  return isNonTextDocType(knownTypes[0]);
};
