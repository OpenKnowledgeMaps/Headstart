import React, { ReactNode } from "react";

import Heading from "../components/Heading";
import BackLink from "../components/Backlink";
import ContextLine from "../components/ContextLine";

class SubdisciplineTitle extends React.Component {
  render() {
    return (
      <>
        <div id="subdiscipline_title">
          <Heading />
          <BackLink />
          <ContextLine popoverContainer={this as any as ReactNode} />
        </div>
      </>
    );
  }
}

export default SubdisciplineTitle;
