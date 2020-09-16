import React from "react";

import Heading from "./Heading";
import Backlink from "./Backlink";
import ContextLine from "./ContextLine";

class SubdisciplineTitle extends React.Component {
  render() {
    return (
      <div id="subdiscipline_title" style={{position: "relative"}}>
        <Heading />
        <Backlink />
        <ContextLine popoverContainer={this} />
      </div>
    );
  }
}

export default SubdisciplineTitle;
