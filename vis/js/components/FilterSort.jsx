import React from "react";
import { connect } from "react-redux";

import StandardFilterSort from "../templates/filtersort/StandardFilterSort";
import BasicFilterSort from "../templates/filtersort/BasicFilterSort";

const FilterSort = ({ showList, showFilter, color }) => {
  if (showFilter) {
    return <StandardFilterSort displaySort={showList} color={color} />;
  }

  return <BasicFilterSort displaySort={showList} color={color} />;
};

const mapStateToProps = (state) => ({
  showList: state.list.show,
  showFilter: state.list.showFilter,
  color: state.selectedBubble ? state.selectedBubble.color : null,
});

export default connect(mapStateToProps)(FilterSort);
