import React from "react";
import { connect } from "react-redux";

import BasicListEntries from "./listentries/BasicListEntries";
import ClassificationListEntries from "./listentries/ClassificationListEntries";
import StandardListEntries from "./listentries/StandardListEntries";

import { filterData, sortData } from "../utils/data";

import { STREAMGRAPH_MODE } from "../reducers/chartType";

import LocalizationProvider from "./LocalizationProvider";

const ListEntries = ({
  show,
  data,
  searchSettings,
  filterSettings,
  sortSettings,
  service,
  localization,
}) => {
  if (!show) {
    return null;
  }

  let displayedData = filterData(data, searchSettings, filterSettings);
  displayedData = sortData(displayedData, sortSettings);

  // TODO move the localization provider to a higher level ASAP

  if (service === null || typeof service === "undefined") {
    return (
      // TODO move the <div id="papers_list" ...> to here
      <LocalizationProvider localization={localization}>
        <BasicListEntries displayedData={displayedData} />
      </LocalizationProvider>
    );
  }

  if (service.startsWith("linkedcat")) {
    return (
      // TODO move the <div id="papers_list" ...> to here
      <LocalizationProvider localization={localization}>
        <ClassificationListEntries displayedData={displayedData} />
      </LocalizationProvider>
    );
  }

  return (
    // TODO move the <div id="papers_list" ...> to here
    <LocalizationProvider localization={localization}>
      <StandardListEntries displayedData={displayedData} />
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  show: state.list.show,
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
  service: state.service,
  localization: state.localization,
});

export default connect(mapStateToProps)(ListEntries);
