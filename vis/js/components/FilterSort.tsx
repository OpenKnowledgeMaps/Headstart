import React, { FC } from "react";
import { connect } from "react-redux";

import BasicFilterSort from "../templates/filtersort/BasicFilterSort";
import StandardFilterSort from "../templates/filtersort/StandardFilterSort";
import { State } from "../types";

export interface FilterSortProps {
  showSort: boolean;
  showFilter: boolean;
  isListVisible: boolean;
  color: string | null;
}

const FilterSort: FC<FilterSortProps> = ({
  showSort,
  showFilter,
  color,
  isListVisible,
}) => {
  const isSortFilterDisplayed = showSort && isListVisible;

  if (showFilter) {
    return (
      <StandardFilterSort displaySort={isSortFilterDisplayed} color={color} />
    );
  }

  return <BasicFilterSort displaySort={isSortFilterDisplayed} color={color} />;
};

const mapStateToProps = (state: State) => ({
  isListVisible: state.list.show,
  showSort: state.list.showSort,
  showFilter: state.list.showFilter,
  color: state.selectedBubble ? state.selectedBubble.color : null,
});

export default connect(mapStateToProps)(FilterSort);
