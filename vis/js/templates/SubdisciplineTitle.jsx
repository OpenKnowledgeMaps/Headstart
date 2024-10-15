import React from "react";

import Heading from "../components/Heading";
import Backlink from "../components/Backlink";
import ContextLine from "../components/ContextLine";

class SubdisciplineTitle extends React.Component {
  render() {
    return (
      <>
        <div id="subdiscipline_title">
          <Heading />
          <Backlink />
          <ContextLine popoverContainer={this} />
        </div>
      </>
    );
  }
}

export default SubdisciplineTitle;
