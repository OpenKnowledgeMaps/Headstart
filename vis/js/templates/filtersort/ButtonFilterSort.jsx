import React from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortButtons from "../../components/filtersort/SortButtons";

const ButtonFilterSort = ({ displaySort, color }) => {
  return (
    // html template starts here
    <div
      id="explorer_options"
      className="row"
      style={{ borderBottom: color ? "5px solid " + color : "" }}
    >
      <SearchBox />
      {!!displaySort && <SortButtons />}
    </div>
    // html template ends here
  );
};

export default ButtonFilterSort;
