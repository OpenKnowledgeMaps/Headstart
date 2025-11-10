import { Control, MapOptions } from "leaflet";

type MapConfig = Required<
  Pick<
    MapOptions,
    | "center"
    | "zoom"
    | "minZoom"
    | "maxZoom"
    | "maxBounds"
    | "maxBoundsViscosity"
    | "worldCopyJump"
    | "keyboard"
    | "zoomControl"
  >
>;

type ZoomControlConfig = Control.ZoomOptions;

interface FeaturesDisablingConfig {
  isShowLayersSwitcher: boolean;
  isShowZoomControls: boolean;
}

export interface Config {
  MAP: MapConfig;
  ZOOM_CONTROL: ZoomControlConfig;
  FEATURES_DISABLING: FeaturesDisablingConfig;
}
