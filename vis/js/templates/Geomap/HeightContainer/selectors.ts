import { State } from "@/js/types";

export const getMapHeight = (state: State) => state.chart.height;
export const getLocalization = (state: State) => state.localization;
export const getTitleLabelType = (state: State) => state.heading.titleLabelType;
export const getQuery = (state: State) => state.query.text;
export const getQueryAdvanced = (state: State) => state.q_advanced.text;
export const getCustomTitle = (state: State) => state.heading.customTitle;
export const getTitleStyle = (state: State) => state.heading.titleStyle;
