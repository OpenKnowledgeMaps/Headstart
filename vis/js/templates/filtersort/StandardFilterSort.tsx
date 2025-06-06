import React from "react";
import FilterDropdown from "../../components/filtersort/FilterDropdown";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

export interface StandardFilterSortProps {
  displaySort: boolean;
  color: string;
}

const StandardFilterSort = ({ displaySort, color }: StandardFilterSortProps) => {
  return (
    // html template starts here
    <div
      id="explorer_options"
      className="row"
      style={{ borderBottom: color ? "5px solid " + color : "" }}
    >
      <SearchBox />
      <FilterDropdown />
      {!!displaySort && <SortDropdown />}
    </div>
    // html template ends here
  );
};

export default StandardFilterSort;
