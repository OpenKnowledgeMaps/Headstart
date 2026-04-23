import { State } from "@/js/types";

export const checkIsSwitchingAllowed = (state: State) => {
  return state.geomapSettings.featuresConfiguration.isWithLayerSwitcher;
};
