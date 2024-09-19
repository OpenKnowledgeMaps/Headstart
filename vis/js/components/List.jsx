import React from "react";
import { connect } from "react-redux";

import { filterData, sortData } from "../utils/data";
import { STREAMGRAPH_MODE } from "../reducers/chartType";
import ListToggle from "../templates/ListToggle";
import FilterSort from "./FilterSort";
import ListEntries from "./ListEntries";

const List = ({
  data,
  searchSettings,
  filterSettings,
  sortSettings,
  fullWidth,
}) => {
  let displayedData = filterData(data, searchSettings, filterSettings);
  displayedData = sortData(displayedData, sortSettings);

  return (
    <div
      id="list-col"
      className="list-col"
      style={{ width: fullWidth ? "100%" : undefined }}
    >
      <div id="list_explorer">
        <div>
          <div className="col-xs-12" id="explorer_header">
            <ListToggle docsNumber={displayedData.length} />
            <FilterSort />
            <ListEntries displayedData={displayedData} />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  data: state.data.list,
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
    docIds: state.selectedBubble ? state.selectedBubble.docIds : null,
  },
  sortSettings: {
    value: state.list.sortValue,
  },
  fullWidth: !state.misc.renderMap,
});

export default connect(mapStateToProps)(List);
