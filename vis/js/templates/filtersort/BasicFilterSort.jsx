import React from "react";
import SearchBox from "../../components/SearchBox";
import SortDropdown from "../../components/SortDropdown";

const BasicFilterSort = ({ displaySort = true }) => {
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
