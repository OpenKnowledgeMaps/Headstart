import { State } from "@/js/types";

export const checkIsWithZoomControl = (state: State) => {
  return state.geomapSettings.featuresConfiguration.isWithZoomControl;
};
