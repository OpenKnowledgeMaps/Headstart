import React from "react";
import FilterDropdown from "../../components/filtersort/FilterDropdown";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

const StandardFilterSort = ({ displaySort }) => {
  return (
    // html template starts here
    // TODO move div back ASAP
    <div id="explorer_options" className="row">
      <SearchBox />
      <FilterDropdown />
      {!!displaySort && <SortDropdown />}
    </div>
    // html template ends here
  );
};

export default StandardFilterSort;
