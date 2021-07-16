import React from "react";
import { connect } from "react-redux";

import BasicListEntries from "./listentries/BasicListEntries";
import ClassificationListEntries from "./listentries/ClassificationListEntries";
import StandardListEntries from "./listentries/StandardListEntries";
import EntriesWrapper from "./listentries/EntriesWrapper";

import { useLocalizationContext } from "./LocalizationProvider";

import { filterData } from "../utils/data";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

const ListEntries = ({
  show,
  service,
  displayedData,
  rawData,
  searchSettings,
  filterSettings,
  isStreamgraph,
}) => {
  const localization = useLocalizationContext();

  if (!show) {
    return null;
  }

  let showEmptyMessage = displayedData.length === 0;
  if (!isStreamgraph && showEmptyMessage) {
    // we have to perform knowledge map filtering here (it's different
    // to the filtering in the List.js component - paper selection is 
    // not taken into account)
    // if the list is empty, but there are visible papers in the zoomed
    // bubble, the message is not displayed
    const papers = filterData(rawData, searchSettings, filterSettings);
    showEmptyMessage = papers.length === 0;
  }

  if (showEmptyMessage) {
    return (
      <EntriesWrapper>
        <div className="empty-area-warning">
          {localization.empty_area_warning}
        </div>
      </EntriesWrapper>
    );
  }

  if (service === null || typeof service === "undefined") {
    return <BasicListEntries displayedData={displayedData} />;
  }

  if (service.startsWith("linkedcat")) {
    return <ClassificationListEntries displayedData={displayedData} />;
  }

  return <StandardListEntries displayedData={displayedData} />;
};

const mapStateToProps = (state) => ({
  show: state.list.show,
  service: state.service,
  rawData: state.data.list,
  searchSettings: {
    value: state.list.searchValue,
  },
  filterSettings: {
    value: state.list.filterValue,
    field: state.list.filterField,
    zoomed: state.zoom,
    area: state.selectedBubble ? state.selectedBubble.uri : null,
    isStreamgraph: state.chartType === STREAMGRAPH_MODE,
    title: state.selectedBubble ? state.selectedBubble.title : null,
    docIds: state.selectedBubble ? state.selectedBubble.docIds : null,
  },
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(ListEntries);
