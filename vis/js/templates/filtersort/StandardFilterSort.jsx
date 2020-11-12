import React from "react";
import FilterDropdown from "../../components/filtersort/FilterDropdown";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

const StandardFilterSort = ({ displaySort }) => {
  return (
    // html template starts here
    // TODO move div back ASAP
    // <div id="explorer_options" class="row">
    <>
      <SearchBox />
      <FilterDropdown />
      {!!displaySort && <SortDropdown />}
    </>
    // html template ends here
  );
};

export default StandardFilterSort;
