import { State } from "@/js/types";

export const getSelectedItemId = (state: State) => state.selectedPaper?.safeId;
