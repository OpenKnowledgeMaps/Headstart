import React, { FC } from "react";
import SearchBox from "../../components/filtersort/SearchBox";
import SortDropdown from "../../components/filtersort/SortDropdown";

interface BasicFilterSortProps {
  displaySort: boolean;
  color: string | null;
}

const BasicFilterSort: FC<BasicFilterSortProps> = ({ displaySort, color }) => {
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
