import React from "react";
import { connect } from "react-redux";

import StandardFilterSort from "../templates/filtersort/StandardFilterSort";
import BasicFilterSort from "../templates/filtersort/BasicFilterSort";
import ButtonFilterSort from "../templates/filtersort/ButtonFilterSort";

const FilterSort = ({ showList, showFilter, showDropdownSort }) => {
  if (showFilter) {
    return <StandardFilterSort displaySort={showList} />;
  }

  if (showDropdownSort) {
    return <BasicFilterSort displaySort={showList} />;
  }

  return <ButtonFilterSort displaySort={showList} />;
};

const mapStateToProps = (state) => ({
  showList: state.list.show,
  showFilter: state.list.showFilter,
  showDropdownSort: state.list.showDropdownSort,
});

export default connect(mapStateToProps)(FilterSort);
