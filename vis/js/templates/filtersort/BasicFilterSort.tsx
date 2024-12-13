import React from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";


export interface BasicFilterSortProps {
  displaySort: boolean;
  color: string;
}

const BasicFilterSort = ({ displaySort, color }: BasicFilterSortProps) => {
  return (
    <div
      id="explorer_options"
      className="row"
      style={{ borderBottom: color ? "5px solid " + color : "" }}
    >
      <SearchBox />
      {!!displaySort && <SortDropdown />}
    </div>
  );
};

export default BasicFilterSort;
