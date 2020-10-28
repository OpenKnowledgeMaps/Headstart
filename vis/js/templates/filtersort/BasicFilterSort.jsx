import React from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

const BasicFilterSort = ({ displaySort }) => {
  return (
    // html template starts here
    // TODO move div back ASAP
    // <div id="explorer_options" class="row">
    <>
      <SearchBox />
      {!!displaySort && <SortDropdown />}
    </>
    // html template ends here
  );
};

export default BasicFilterSort;
