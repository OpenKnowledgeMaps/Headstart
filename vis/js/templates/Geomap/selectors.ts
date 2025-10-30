import { State } from "@/js/types";

export const getSelectedItemId = (state: State) => state.selectedPaper?.safeId;
export const getHoveredItemId = (state: State) =>
  state.data.options.hoveredItemId;
