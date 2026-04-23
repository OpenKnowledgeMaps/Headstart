import { GEOMAP_MODE } from "@js/reducers/chartType";
import { Action, GeomapSettings } from "@js/types";

const DEFAULT_STATE_VALUE: GeomapSettings = {
  featuresConfiguration: {
    isWithLayerSwitcher: true,
    isWithZoomControl: true,
  },
};

type GeomapReducerType = (
  prevState: GeomapSettings | undefined,
  action: Action,
) => GeomapSettings;

export const geomapSettings: GeomapReducerType = (prevState, action) => {
  const state = prevState ?? DEFAULT_STATE_VALUE;

  switch (action.type) {
    case "INITIALIZE": {
      if (!("configObject" in action) || !action.configObject) {
        return DEFAULT_STATE_VALUE;
      }

      const { visualization_type, geomap } = action.configObject;

      if (visualization_type !== GEOMAP_MODE) {
        return DEFAULT_STATE_VALUE;
      }

      const settings = geomap.featuresConfiguration;

      return {
        featuresConfiguration: { ...settings },
      };
    }
    default: {
      return state;
    }
  }
};
