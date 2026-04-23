import React, { FC } from "react";
import FilterDropdown from "../../components/filtersort/FilterDropdown";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

interface StandardFilterSortProps {
  displaySort: boolean;
  color: string | null;
}

const StandardFilterSort: FC<StandardFilterSortProps> = ({
  displaySort,
  color,
}) => {
  return (
    <div
      id="explorer_options"
      className="row"
      style={{ borderBottom: color ? "5px solid " + color : "" }}
    >
      <SearchBox />
      <FilterDropdown />
      {!!displaySort && <SortDropdown />}
    </div>
  );
};

export default StandardFilterSort;
