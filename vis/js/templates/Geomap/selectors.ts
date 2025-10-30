import { STREAMGRAPH_MODE } from "@/js/reducers/chartType";
import { State } from "@/js/types";

export const getData = (state: State) => state.data.list;

export const getSelectedItemId = (state: State) => state.selectedPaper?.safeId;

export const getSearchSettings = (state: State) => ({
  value: state.list.searchValue,
});

export const getSearchFilterSettings = (state: State) => ({
  value: state.list.filterValue,
  field: state.list.filterField,
  zoomed: state.zoom,
  area: state.selectedBubble ? state.selectedBubble.uri : null,
  paper: null,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  title: state.selectedBubble ? state.selectedBubble.title : null,
  docIds: state.selectedBubble ? state.selectedBubble.docIds : null,
});
