import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "./LocalizationProvider";

import { filterData } from "../utils/data";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

import EntriesWrapper from "./EntriesWrapper";
import StandardListEntry from "../templates/listentry/StandardListEntry";

const ListEntries = ({
  // data
  show,
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

  return (
    <EntriesWrapper>
      {displayedData.map((paper) => (
        <StandardListEntry key={paper.safe_id} paper={paper} />
      ))}
    </EntriesWrapper>
  );
};

const mapStateToProps = (state) => ({
  show: state.list.show,
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
