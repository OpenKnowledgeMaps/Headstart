import React, { FC } from "react";
import { connect } from "react-redux";

import BasicFilterSort from "../templates/filtersort/BasicFilterSort";
import StandardFilterSort from "../templates/filtersort/StandardFilterSort";
import { State } from "../types";

export interface FilterSortProps {
  showSort: boolean;
  showFilter: boolean;
  color: string | null;
}

const FilterSort: FC<FilterSortProps> = ({ showSort, showFilter, color }) => {
  if (showFilter) {
    return <StandardFilterSort displaySort={showSort} color={color} />;
  }

  return <BasicFilterSort displaySort={showSort} color={color} />;
};

const mapStateToProps = (state: State) => ({
  showSort: state.list.showSort,
  showFilter: state.list.showFilter,
  color: state.selectedBubble ? state.selectedBubble.color : null,
});

export default connect(mapStateToProps)(FilterSort);
