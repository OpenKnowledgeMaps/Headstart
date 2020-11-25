import React from "react";
import { connect } from "react-redux";

import LocalizationProvider from "./LocalizationProvider";

import { filterData, sortData } from "../utils/data";
import { STREAMGRAPH_MODE } from "../reducers/chartType";
import ListToggle from "./ListToggle";
import FilterSort from "./FilterSort";
import ListEntries from "./ListEntries";

const List = ({
  data,
  searchSettings,
  filterSettings,
  sortSettings,
  localization,
}) => {
  let displayedData = filterData(data, searchSettings, filterSettings);
  displayedData = sortData(displayedData, sortSettings);

  return (
    <LocalizationProvider localization={localization}>
      <div id="list_explorer">
        <div>
          <div className="col-xs-12" id="explorer_header">
            <ListToggle docsNumber={displayedData.length} />
            <FilterSort />
            <ListEntries displayedData={displayedData} />
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  data: state.data,
  searchSettings: {
    value: state.list.searchValue,
  },
  filterSettings: {
    value: state.list.filterValue,
    field: state.list.filterField,
    zoomed: state.zoom,
    area: state.selectedBubble ? state.selectedBubble.uri : null,
    paper: state.selectedPaper ? state.selectedPaper.safeId : null,
    isStreamgraph: state.chartType === STREAMGRAPH_MODE,
    title: state.selectedBubble ? state.selectedBubble.title : null,
  },
  sortSettings: {
    value: state.list.sortValue,
  },
  localization: state.localization,
});

export default connect(mapStateToProps)(List);
