import React from "react";
import { connect } from "react-redux";

import StandardFilterSort from "../templates/filtersort/StandardFilterSort";
import BasicFilterSort from "../templates/filtersort/BasicFilterSort";
import ButtonFilterSort from "../templates/filtersort/ButtonFilterSort";

const FilterSort = ({ showList, showFilter, showDropdownSort, color }) => {
  if (showFilter) {
    return <StandardFilterSort displaySort={showList} color={color} />;
  }

  if (showDropdownSort) {
    return <BasicFilterSort displaySort={showList} color={color} />;
  }

  return <ButtonFilterSort displaySort={showList} />;
};

const mapStateToProps = (state) => ({
  showList: state.list.show,
  showFilter: state.list.showFilter,
  showDropdownSort: state.list.showDropdownSort,
  color: state.selectedBubble ? state.selectedBubble.color : null,
});

export default connect(mapStateToProps)(FilterSort);
