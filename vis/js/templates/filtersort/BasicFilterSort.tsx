// @ts-nocheck
import React from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

const BasicFilterSort = ({ displaySort, color }) => {
  return (
    // html template starts here
    <div
      id="explorer_options"
      className="row"
      style={{ borderBottom: color ? "5px solid " + color : "" }}
    >
      <SearchBox />
      {!!displaySort && <SortDropdown />}
    </div>
    // html template ends here
  );
};

export default BasicFilterSort;
