import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "./LocalizationProvider";

import { filterData } from "../utils/data";
import { STREAMGRAPH_MODE } from "../reducers/chartType";
import { mapDispatchToListEntriesProps } from "../utils/eventhandlers";

import EntriesWrapper from "./EntriesWrapper";
import BasicListEntry from "../templates/listentry/BasicListEntry";
import ClassificationListEntry from "../templates/listentry/ClassificationListEntry";
import StandardListEntry from "../templates/listentry/StandardListEntry";

const ListEntries = ({
  // data
  show,
  service,
  displayedData,
  rawData,
  searchSettings,
  filterSettings,
  isStreamgraph,
  disableClicks,
  // functions
  handleZoomIn,
}) => {
  const localization = useLocalizationContext();

  const handleAreaClick = (paper) => {
    if (disableClicks) {
      return;
    }
    handleZoomIn(paper);
  };

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

  const ListEntryComponent = getListEntryComponent(service);

  return (
    <EntriesWrapper>
      {displayedData.map((paper) => (
        <ListEntryComponent
          key={paper.safe_id}
          paper={paper}
          handleAreaClick={() => handleAreaClick(paper)}
        />
      ))}
    </EntriesWrapper>
  );
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
  disableClicks: state.list.disableClicks,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(ListEntries);

const getListEntryComponent = (service) => {
  if (service === null || typeof service === "undefined") {
    return BasicListEntry;
  }

  if (service.startsWith("linkedcat")) {
    return ClassificationListEntry;
  }

  return StandardListEntry;
};
