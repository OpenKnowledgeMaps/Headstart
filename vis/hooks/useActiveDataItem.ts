/**
 * The hook allows to access a selected or hovered item id in the List.
 */

import { useSelector } from "react-redux";

import { State } from "@/js/types";

const getSelectedItemId = (state: State) => state.selectedPaper?.safeId;
const getHoveredItemId = (state: State) => state.data.options.hoveredItemId;

export const useActiveDataItem = () => {
  const selectedItemId = useSelector(getSelectedItemId);
  const hoveredItemId = useSelector(getHoveredItemId);

  return { selectedItemId, hoveredItemId };
};
