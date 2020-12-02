import React from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortButtons from "../../components/filtersort/SortButtons";

const ButtonFilterSort = ({ displaySort }) => {
  return (
    // html template starts here
    <div id="explorer_options" className="row">
      <SearchBox />
      {!!displaySort && <SortButtons />}
    </div>
    // html template ends here
  );
};

export default ButtonFilterSort;
