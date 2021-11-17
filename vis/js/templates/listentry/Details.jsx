import React from "react";
import { connect } from "react-redux";

import Highlight from "../../components/Highlight";

const Details = ({ authors, source, isSelected }) => {
  return (
    // html template starts here
    <div className="list_details">
      <div className="list_authors">
        <Highlight queryHighlight>{authors}</Highlight>
      </div>
      {!!source && (
        <div className={"list_source" + (isSelected ? "" : " short")}>
          <span className="list_in">
            <Highlight> in </Highlight>
          </span>
          <span className="list_published_in">
            <Highlight queryHighlight>{source}</Highlight>
          </span>
        </div>
      )}
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isSelected: !!state.selectedPaper,
});

export default connect(mapStateToProps)(React.memo(Details));
