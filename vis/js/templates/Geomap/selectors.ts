import { State } from "@/js/types";

export const getGeomapFeaturesSettings = (state: State) => {
  return state.geomapSettings.featuresConfiguration;
};
