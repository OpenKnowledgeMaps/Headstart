import React from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

const BasicFilterSort = ({ displaySort }) => {
  return (
    // html template starts here
    <div id="explorer_options" className="row">
      <SearchBox />
      {!!displaySort && <SortDropdown />}
    </div>
    // html template ends here
  );
};

export default BasicFilterSort;
