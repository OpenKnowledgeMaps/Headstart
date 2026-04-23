/**
 * The hook allows to access filtered data or filtered and sorted data,
 * which can then be used in the component without creating selectors
 * and calling filter and sorting functions.
 */

import { useSelector } from "react-redux";

import { STREAMGRAPH_MODE } from "@/js/reducers/chartType";
import { AllPossiblePapersType, State } from "@/js/types";
import { filterData, sortData } from "@/js/utils/data";

const getData = (state: State) => state.data.list;

const getSearchSettings = (state: State) => ({
  value: state.list.searchValue,
});

const getSortSettings = (state: State) => ({
  value: state.list.sortValue,
});

const getSearchFilterSettings = (state: State) => ({
  value: state.list.filterValue,
  field: state.list.filterField,
  zoomed: state.zoom,
  area: state.selectedBubble ? state.selectedBubble.uri : null,
  paper: null,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  title: state.selectedBubble ? state.selectedBubble.title : null,
  docIds: state.selectedBubble ? state.selectedBubble.docIds : null,
});

export const useData = (isFilter: boolean = false, isSort: boolean = false) => {
  const initialData = useSelector(getData);
  const searchSettings = useSelector(getSearchSettings);
  const sortSettings = useSelector(getSortSettings);
  const filterSettings = useSelector(getSearchFilterSettings);

  let filteredData: AllPossiblePapersType[] | null = null;
  if (isFilter) {
    filteredData = filterData(initialData, searchSettings, filterSettings);
  }

  let filteredAndSortedData: AllPossiblePapersType[] | null = null;
  if (isSort) {
    filteredAndSortedData = sortData(filteredData, sortSettings);
  }

  return { initialData, filteredData, filteredAndSortedData };
};
