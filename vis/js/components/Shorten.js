import React from "react";
import shave from "shave";
import { select } from "d3-selection";

/**
 * Truncates the text in the child component tree using shave library.
 *
 * Accepts one child element as an input and property 'height' with
 * the specified max height.
 */
class Shorten extends React.Component {
  constructor(props) {
    super(props);
    this.shorten = this.shorten.bind(this);

    this.childRef = null;
  }

  componentDidMount() {
    this.shorten();
  }

  componentDidUpdate() {
    this.shorten();
  }

  render() {
    const childElement = React.Children.only(this.props.children);

    return React.cloneElement(childElement, {
      ref: (el) => (this.childRef = el),
    });
  }

  shorten() {
    window.requestAnimationFrame(() => {
      const childRef = this.childRef;
      const marginTop = childRef
        ? parseInt(select(childRef).style("margin-top"), 10)
        : 0;
      const marginBottom = childRef
        ? parseInt(select(childRef).style("margin-bottom"), 10)
        : 0;
      const maxHeight = this.props.height - marginTop - marginBottom;

      shave(childRef, maxHeight);
    });
  }
}

export default Shorten;
